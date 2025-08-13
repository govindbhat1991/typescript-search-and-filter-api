import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';

import { SearchService } from '../elasticsearch/search.service';
import { Record as RecordEntity } from './entities/record.entity';
import { AddressType } from './entities/address-type.entity';
import { Country } from './entities/country.entity';
import { ThreatLevel } from './entities/threat-level.entity';
import { UsageType } from './entities/usage-type.entity';

interface ElasticsearchResponse {
  hits: {
    total: number | { value: number };
    hits: Array<{ _source: any }>;
  };
}

@Injectable()
export class RecordsService {
  private index = 'records_v1';

  constructor(
    @InjectRepository(RecordEntity)
    private readonly repo: Repository<RecordEntity>,
    @InjectRepository(AddressType)
    private readonly addressTypeRepo: Repository<AddressType>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(ThreatLevel)
    private readonly threatLevelRepo: Repository<ThreatLevel>,
    @InjectRepository(UsageType)
    private readonly usageTypeRepo: Repository<UsageType>,
    private readonly elasticSearch: SearchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Reference data methods
  async getAddressTypes() {
    const key = 'addressTypes';
    const cached = await this.cacheManager.get(key);
    if (cached) return cached;
    
    const addressTypes = await this.addressTypeRepo.find({
      order: { name: 'ASC' }
    });
    await this.cacheManager.set(key, addressTypes, 3600); // Cache for 1 hour
    return addressTypes;
  }

  async getCountries() {
    const key = 'countries';
    const cached = await this.cacheManager.get(key);
    if (cached) return cached;
    
    const countries = await this.countryRepo.find({
      order: { name: 'ASC' }
    });
    await this.cacheManager.set(key, countries, 3600); // Cache for 1 hour
    return countries;
  }

  async getThreatLevels() {
    const key = 'threatLevels';
    const cached = await this.cacheManager.get(key);
    if (cached) return cached;
    
    const threatLevels = await this.threatLevelRepo.find({
      order: { name: 'ASC' }
    });
    await this.cacheManager.set(key, threatLevels, 3600); // Cache for 1 hour
    return threatLevels;
  }

  async getUsageTypes() {
    const key = 'usageTypes';
    const cached = await this.cacheManager.get(key);
    if (cached) return cached;
    
    const usageTypes = await this.usageTypeRepo.find({
      order: { name: 'ASC' }
    });
    await this.cacheManager.set(key, usageTypes, 3600); // Cache for 1 hour
    return usageTypes;
  }

  // builds search query, checks cache, otherwise queries ES
  async search(q: string, page = 1, size = 20, filters: any = {}, sorting: any = {}) {
    const key = `search:${q}:p${page}:s${size}:f${JSON.stringify(filters)}:s${JSON.stringify(sorting)}`;
    const cached = await this.cacheManager.get(key);
    if (cached) return cached;

    const esQuery: any = {
      query: {
        bool: {
          must: q
            ? [
                {
                  bool: {
                    should: [
                      // Text-based search for non-IP fields (case-insensitive using match)
                      {
                        multi_match: {
                          query: q,
                          fields: [
                            'organization^3',
                            'threatDetails^2',
                            'addressType.name',
                            'country.name',
                            'usageType.name',
                            'threatLevel.name',
                          ],
                          type: 'best_fields',
                          fuzziness: 'AUTO'
                        },
                      },
                      // Case-insensitive search using match queries
                      {
                        bool: {
                          should: [
                            { match: { organization: { query: q, operator: 'or' } } },
                            { match: { threatDetails: { query: q, operator: 'or' } } },
                            { match: { 'addressType.name': { query: q, operator: 'or' } } },
                            { match: { 'country.name': { query: q, operator: 'or' } } },
                            { match: { 'usageType.name': { query: q, operator: 'or' } } },
                            { match: { 'threatLevel.name': { query: q, operator: 'or' } } },
                          ],
                          minimum_should_match: 1
                        }
                      },
                      // IP address search (only if query looks like an IP)
                      ...(this.isValidIP(q) ? [{
                        term: { addressIp: q }
                      }] : [])
                    ],
                    minimum_should_match: 1
                  }
                }
              ]
            : [{ match_all: {} }],
          filter: [],
        },
      },
      from: (page - 1) * size,
      size,
    };

    // Add sorting if provided
    if (sorting.sortBy && sorting.sortDir) {
      const sortDirection = sorting.sortDir.toLowerCase() === 'desc' ? 'desc' : 'asc';
      const sortField = this.getSortField(sorting.sortBy);
      
      if (sortField) {
        esQuery.sort = [{ [sortField]: sortDirection }];
      }
    }

    // Update filter names to match the new resolver arguments
    if (filters.addressTypeId) {
      esQuery.query.bool.filter.push({
        term: { 'addressType.id': filters.addressTypeId },
      });
    }
    if (filters.threatLevelId) {
      esQuery.query.bool.filter.push({
        term: { 'threatLevel.id': filters.threatLevelId },
      });
    }
    if (filters.usageTypeId) {
      esQuery.query.bool.filter.push({
        term: { 'usageType.id': filters.usageTypeId },
      });
    }
    if (filters.countryId) {
      esQuery.query.bool.filter.push({
        term: { 'country.id': filters.countryId },
      });
    }
    if (filters.organization) {
      esQuery.query.bool.filter.push({
        match: { 
          organization: filters.organization
        },
      });
    }
    if (filters.firstSeenFrom || filters.firstSeenTo) {
      const range: any = {};
      if (filters.firstSeenFrom) range.gte = filters.firstSeenFrom;
      if (filters.firstSeenTo) range.lte = filters.firstSeenTo;
      esQuery.query.bool.filter.push({
        range: { firstSeen: range },
      });
    }
    if (filters.lastSeenFrom || filters.lastSeenTo) {
      const range: any = {};
      if (filters.lastSeenFrom) range.gte = filters.lastSeenFrom;
      if (filters.lastSeenTo) range.lte = filters.lastSeenTo;
      esQuery.query.bool.filter.push({
        range: { lastSeen: range },
      });
    }

    const resp = (await this.elasticSearch.search(
      this.index,
      esQuery,
    )) as ElasticsearchResponse;
    const total =
      typeof resp.hits?.total === 'number'
        ? resp.hits.total
        : (resp.hits?.total?.value ?? 0);
    
    // Process items and handle null values
    const items = resp.hits.hits
      .map((h) => h._source)
      .filter((item) => {
        // Filter out items that don't have required fields
        return item && item.id && item.addressIp;
      })
      .map((item) => {
        // Ensure all required fields have values, provide defaults if needed
        return {
          ...item,
          // Ensure addressType has a valid structure
          addressType: item.addressType || { id: 0, name: 'Unknown' },
          // Ensure usageType has a valid structure
          usageType: item.usageType || { id: 0, name: 'Unknown' },
          // Ensure threatLevel has a valid structure
          threatLevel: item.threatLevel || { id: 0, name: 'Unknown' },
          // Ensure country has a valid structure if present
          country: item.country || null,
        };
      });
    
    // Calculate page information
    const currentPage = page;
    const pageSize = size;
    const totalPages = Math.ceil(total / pageSize);
    
    const result = { 
      total, 
      currentPage, 
      pageSize, 
      totalPages, 
      items 
    };
    await this.cacheManager.set(key, result, 30);
    return result;
  }

  async findById(id: number) {
    const key = `record:${id}`;
    const cached = await this.cacheManager.get(key);
    if (cached) return cached;
    const r = await this.repo.findOne({ where: { id } });
    if (r) await this.cacheManager.set(key, r, 300);
    return r;
  }

  // Helper method to check if a string is a valid IP address
  private isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  // Helper method to map resolver sortBy field to Elasticsearch sort field
  private getSortField(sortBy: string): string | undefined {
    switch (sortBy) {
      case 'id':
        return 'id';
      case 'organization':
        return 'organization';
      case 'addressIp':
        return 'addressIp';
      case 'firstSeen':
        return 'firstSeen';
      case 'lastSeen':
        return 'lastSeen';
      case 'threatLevel':
        return 'threatLevel.name';
      case 'usageType':
        return 'usageType.name';
      case 'country':
        return 'country.name';
      default:
        return undefined;
    }
  }
}

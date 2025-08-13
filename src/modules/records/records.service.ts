import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';

import { SearchService } from '../elasticsearch/search.service';
import { Record as RecordEntity } from './entities/record.entity';

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
    private readonly elasticSearch: SearchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // builds search query, checks cache, otherwise queries ES
  async search(q: string, page = 1, size = 20, filters: any = {}) {
    const key = `search:${q}:p${page}:s${size}:f${JSON.stringify(filters)}`;
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
                      // Text-based search for non-IP fields
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
        match: { organization: filters.organization },
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
    const items = resp.hits.hits.map((h) => h._source);
    const result = { total, items };
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
}

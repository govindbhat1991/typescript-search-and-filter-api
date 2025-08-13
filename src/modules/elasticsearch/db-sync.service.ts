import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchService } from './search.service';
import { Record as RecordEntity } from '../records/entities/record.entity';
import { AddressType } from '../records/entities/address-type.entity';
import { Country } from '../records/entities/country.entity';
import { UsageType } from '../records/entities/usage-type.entity';
import { ThreatLevel } from '../records/entities/threat-level.entity';

@Injectable()
export class DbSyncService implements OnModuleInit {
  constructor(
    @InjectRepository(RecordEntity)
    private readonly recordRepo: Repository<RecordEntity>,
    @InjectRepository(AddressType)
    private readonly addressTypeRepo: Repository<AddressType>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(UsageType)
    private readonly usageTypeRepo: Repository<UsageType>,
    @InjectRepository(ThreatLevel)
    private readonly threatLevelRepo: Repository<ThreatLevel>,
    private readonly searchService: SearchService,
  ) {}

  async onModuleInit() {
    // Wait for the index to be created, @TODO, should be a better logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.syncDataFromDatabase();
  }

  private async syncDataFromDatabase() {
    const indexName = 'records_v1';
    
    try {
      // Check if index already has data
      const existingData = await this.searchService.search(indexName, {
        query: { match_all: {} },
        size: 1
      });

      const totalHits = typeof existingData.hits.total === 'number' 
        ? existingData.hits.total 
        : existingData.hits.total.value;

      if (totalHits > 0) {
        console.log('Elasticsearch index already has data, skipping sync...');
        return;
      }

      console.log('Starting database to Elasticsearch sync...');

      // Get all records with their relations
      const records = await this.recordRepo.find({
        relations: ['addressType', 'country', 'usageType', 'threatLevel'],
      });

      if (records.length === 0) {
        console.log('No records found in database, skipping sync...');
        return;
      }

      console.log(`Found ${records.length} records to sync...`);

      // Transform records for Elasticsearch
      const elasticsearchRecords = records.map(record => ({
        id: record.id,
        addressIp: record.addressIp,
        organization: record.organization,
        threatDetails: record.threatDetails,
        firstSeen: record.firstSeen,
        lastSeen: record.lastSeen,
        addressType: record.addressType ? {
          id: record.addressType.id,
          name: record.addressType.name
        } : null,
        country: record.country ? {
          id: record.country.id,
          name: record.country.name,
          code: record.country.code
        } : null,
        usageType: record.usageType ? {
          id: record.usageType.id,
          name: record.usageType.name
        } : null,
        threatLevel: record.threatLevel ? {
          id: record.threatLevel.id,
          name: record.threatLevel.name
        } : null
      }));

      // Prepare bulk actions
      const actions = elasticsearchRecords.map(record => ({
        id: record.id.toString(),
        body: record
      }));

      // Bulk index to Elasticsearch
      await this.searchService.bulk(indexName, actions);
      
      console.log(`Successfully synced ${records.length} records to Elasticsearch`);
      
    } catch (error) {
      console.error('Failed to sync data from database:', error);
    }
  }

  // Method to manually trigger sync (useful for testing)
  async manualSync() {
    console.log('Manual sync triggered...');
    await this.syncDataFromDatabase();
  }
} 
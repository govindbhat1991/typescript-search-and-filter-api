import { Injectable, OnModuleInit } from '@nestjs/common';
import { SearchService } from './search.service';

@Injectable()
export class ElasticsearchInitService implements OnModuleInit {
  constructor(private readonly searchService: SearchService) {}

  async onModuleInit() {
    await this.createRecordsIndex();
  }

  private async createRecordsIndex() {
    const indexName = 'records_v1';
    const mapping = {
      mappings: {
        properties: {
          id: { type: 'integer' },
          addressIp: { type: 'ip' },
          organization: { type: 'text' },
          threatDetails: { type: 'text' },
          firstSeen: { type: 'date' },
          lastSeen: { type: 'date' },
          addressType: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'keyword' }
            }
          },
          country: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'keyword' },
              code: { type: 'keyword' }
            }
          },
          usageType: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'keyword' }
            }
          },
          threatLevel: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'keyword' }
            }
          }
        }
      },
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        analysis: {
          analyzer: {
            text_analyzer: {
              type: 'standard',
              stopwords: '_english_'
            }
          }
        }
      }
    };

    try {
      await this.searchService.createIndexIfNotExists(indexName, mapping);
      console.log(`Elasticsearch index '${indexName}' created/verified successfully`);
    } catch (error) {
      console.error(`Failed to create Elasticsearch index '${indexName}':`, error);
    }
  }
} 
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '@elastic/elasticsearch';

import { SearchService } from './search.service';
import { ElasticsearchInitService } from './elasticsearch-init.service';
import { DbSyncService } from './db-sync.service';
import { Record as RecordEntity } from '../records/entities/record.entity';
import { AddressType } from '../records/entities/address-type.entity';
import { Country } from '../records/entities/country.entity';
import { UsageType } from '../records/entities/usage-type.entity';
import { ThreatLevel } from '../records/entities/threat-level.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecordEntity,
      AddressType,
      Country,
      UsageType,
      ThreatLevel,
    ]),
  ],
  providers: [
    {
      provide: 'ELASTIC_CLIENT',
      useFactory: () => {
        const node = process.env.ELASTIC_URL || 'http://localhost:9200';
        return new Client({ 
          node
        });
      },
    },
    SearchService,
    ElasticsearchInitService,
    DbSyncService,
  ],
  exports: ['ELASTIC_CLIENT', SearchService, DbSyncService],
})
export class ElasticsearchModule {}

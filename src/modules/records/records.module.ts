import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { AddressType } from './entities/address-type.entity';
import { Continent } from './entities/continent.entity';
import { Country } from './entities/country.entity';
import { Record as RecordEntity } from './entities/record.entity';
import { ThreatLevel } from './entities/threat-level.entity';
import { UsageType } from './entities/usage-type.entity';
import { RecordsResolver } from './records.resolver';
import { RecordsService } from './records.service';
import { RecordSubscriber } from './subscribers/record.subscriber';

@Module({
  imports: [
    CacheModule.register(),
    ElasticsearchModule,
    TypeOrmModule.forFeature([
      RecordEntity,
      AddressType,
      Continent,
      Country,
      ThreatLevel,
      UsageType,
    ]),
  ],
  providers: [RecordsService, RecordsResolver, RecordSubscriber],
  exports: [RecordsService],
})
export class RecordsModule {}

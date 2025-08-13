import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { RecordsService } from './records.service';
import { SearchRecordsResponseDto, RecordDto } from './dto/record.dto';
import { DbSyncService } from '../elasticsearch/db-sync.service';

@Resolver()
export class RecordsResolver {
  constructor(
    private readonly service: RecordsService,
    private readonly dbSyncService: DbSyncService,
  ) {}

  @Query(() => SearchRecordsResponseDto, { name: 'searchRecords' })
  async searchRecords(
    @Args('q', { type: () => String, nullable: true }) q: string,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('size', { type: () => Int, nullable: true }) size = 20,
    @Args('addressTypeId', { type: () => Int, nullable: true }) addressTypeId?: number,
    @Args('threatLevelId', { type: () => Int, nullable: true }) threatLevelId?: number,
    @Args('usageTypeId', { type: () => Int, nullable: true }) usageTypeId?: number,
    @Args('countryId', { type: () => Int, nullable: true }) countryId?: number,
    @Args('organization', { type: () => String, nullable: true }) organization?: string,
    @Args('firstSeenFrom', { type: () => Date, nullable: true }) firstSeenFrom?: Date,
    @Args('firstSeenTo', { type: () => Date, nullable: true }) firstSeenTo?: Date,
    @Args('lastSeenFrom', { type: () => Date, nullable: true }) lastSeenFrom?: Date,
    @Args('lastSeenTo', { type: () => Date, nullable: true }) lastSeenTo?: Date,
  ) {
    const filters: any = {
      ...(addressTypeId && { addressTypeId }),
      ...(threatLevelId && { threatLevelId }),
      ...(usageTypeId && { usageTypeId }),
      ...(countryId && { countryId }),
      ...(organization && { organization }),
      ...(firstSeenFrom && { firstSeenFrom }),
      ...(firstSeenTo && { firstSeenTo }),
      ...(lastSeenFrom && { lastSeenFrom }),
      ...(lastSeenTo && { lastSeenTo }),
    };
    return this.service.search(q, page, size, filters);
  }

  @Query(() => RecordDto, { name: 'record' })
  async getRecord(@Args('id', { type: () => Int }) id: number) {
    return this.service.findById(id);
  }

  @Mutation(() => String, { name: 'syncDatabaseToElasticsearch' })
  async syncDatabaseToElasticsearch() {
    await this.dbSyncService.manualSync();
    return 'Database sync to Elasticsearch completed successfully';
  }
}

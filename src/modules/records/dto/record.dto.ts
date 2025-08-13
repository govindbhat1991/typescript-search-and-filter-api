import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { DateTimeScalar } from '../../../common/graphql/date-time.scalar';
import { AddressTypeDto, CountryDto, UsageTypeDto, ThreatLevelDto } from './reference.dto';

@ObjectType()
export class RecordDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  addressIp: string;

  @Field(() => AddressTypeDto, { nullable: true })
  addressType?: AddressTypeDto;

  @Field(() => String, { nullable: true })
  organization?: string;

  @Field(() => CountryDto, { nullable: true })
  country?: CountryDto;

  @Field(() => UsageTypeDto, { nullable: true })
  usageType?: UsageTypeDto;

  @Field(() => ThreatLevelDto, { nullable: true })
  threatLevel?: ThreatLevelDto;

  @Field(() => String, { nullable: true })
  threatDetails?: string;

  @Field(() => DateTimeScalar, { nullable: true })
  firstSeen?: Date;

  @Field(() => DateTimeScalar, { nullable: true })
  lastSeen?: Date;
}

@ObjectType()
export class SearchRecordsResponseDto {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => [RecordDto])
  items: RecordDto[];
} 
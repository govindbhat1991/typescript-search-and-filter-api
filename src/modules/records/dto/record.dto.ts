import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class AddressTypeDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class CountryDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  code: string;
}

@ObjectType()
export class UsageTypeDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class ThreatLevelDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class RecordDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  addressIp: string;

  @Field(() => AddressTypeDto)
  addressType: AddressTypeDto;

  @Field(() => String, { nullable: true })
  organization?: string;

  @Field(() => CountryDto, { nullable: true })
  country?: CountryDto;

  @Field(() => UsageTypeDto)
  usageType: UsageTypeDto;

  @Field(() => ThreatLevelDto)
  threatLevel: ThreatLevelDto;

  @Field(() => String, { nullable: true })
  threatDetails?: string;

  @Field(() => Date, { nullable: true })
  firstSeen?: Date;

  @Field(() => Date, { nullable: true })
  lastSeen?: Date;
}

@ObjectType()
export class SearchRecordsResponseDto {
  @Field(() => Int)
  total: number;

  @Field(() => [RecordDto])
  items: RecordDto[];
} 
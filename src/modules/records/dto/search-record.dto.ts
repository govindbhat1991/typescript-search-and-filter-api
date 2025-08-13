import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class SearchRecordDto {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  addressIp?: string;

  @Field(() => String, { nullable: true })
  organization?: string;

  @Field(() => String, { nullable: true })
  threatDetails?: string;

  @Field(() => String, { nullable: true })
  addressTypeName?: string;

  @Field(() => String, { nullable: true })
  countryName?: string;

  @Field(() => String, { nullable: true })
  usageTypeName?: string;

  @Field(() => String, { nullable: true })
  threatLevelName?: string;
}

@ObjectType()
export class SearchRecordsResponseDto {
  @Field(() => Int)
  total: number;

  @Field(() => [SearchRecordDto])
  items: SearchRecordDto[];
} 
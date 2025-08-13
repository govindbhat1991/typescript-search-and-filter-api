import { Field, ObjectType, Int } from '@nestjs/graphql';

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
export class ThreatLevelDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class UsageTypeDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;
} 
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import * as redisStore from 'cache-manager-ioredis';

const cacheConfig = {
  store: redisStore,
  host: process.env.REDIS_HOST || 'localhost',
  port: +(process.env.REDIS_PORT || 6379),
  ttl: 30,
};

@Module({})
export class CustomCacheModule {
  static forRoot(options: CacheModuleOptions = cacheConfig): DynamicModule {
    return {
      module: CustomCacheModule,
      imports: [CacheModule.register(options), DiscoveryModule],
      global: true,
    };
  }
}

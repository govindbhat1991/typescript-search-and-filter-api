import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { join } from 'path';
import { cwd } from 'process';
import { httpStatusPlugin } from '../exceptions/exception.plugin';
import { EnvironmentVariables } from '../helper/env.validation';

@Injectable()
export class GraphqlConfigService
  implements GqlOptionsFactory<ApolloDriverConfig>
{
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  createGqlOptions(): Promise<ApolloDriverConfig> | ApolloDriverConfig {
    console.log("production: ", this.configService.get('NODE_ENV'));
    return {
      driver: ApolloDriver,
      autoSchemaFile: join(
        cwd(),
        `${this.configService.get('NODE_ENV') === 'test' ? 'test' : 'src'}/graphql-schema.gql`,
      ),
      sortSchema: true,
      cache: 'bounded',
      csrfPrevention: this.configService.get('NODE_ENV') !== 'development',
      context: ({ req }) => ({ req }),
      introspection: this.configService.get('NODE_ENV') !== 'production',
      plugins: [
        httpStatusPlugin,
        // this.configService.get('NODE_ENV') === 'production'
        //   ? ApolloServerPluginLandingPageProductionDefault()
        //   : ApolloServerPluginLandingPageLocalDefault(),
      ],
    };
  }
}

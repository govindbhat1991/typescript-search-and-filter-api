import { ConfigService } from '@nestjs/config';

import { config } from 'dotenv';
import { join } from 'path';
import { cwd, env } from 'process';
import { DataSource, DataSourceOptions } from 'typeorm';

import { getEnvPath } from '../helper/env.helper';

config({
  path: getEnvPath(cwd()),
});

export const setTypeormConfig = (
  conf: NodeJS.ProcessEnv | ConfigService,
): DataSourceOptions => {
  const getConfigValue =
    conf instanceof ConfigService
      ? conf.get.bind(conf)
      : (key: string) => conf[key];

  return {
    type: 'postgres',
    host: getConfigValue('DOCKER_ENV') === "true" ? getConfigValue('PG_HOST') : "localhost",
    port: Number(getConfigValue('PG_PORT')),
    username: getConfigValue('PG_USER'),
    password: getConfigValue('PG_PASSWORD'),
    database: getConfigValue('PG_DB'),
    entities:
      getConfigValue('NODE_ENV') === 'test'
        ? [join(cwd(), 'src', '**', '*.entity.{ts,js}')]
        : [join(cwd(), 'dist', '**', '*.entity.js')],
    synchronize: getConfigValue('NODE_ENV') !== 'production',
    dropSchema: getConfigValue('NODE_ENV') === 'test',
    migrations: [
      join(cwd(), 'dist', 'common', 'database', 'migrations', '*{.ts,.js}'),
    ],
    migrationsRun: false,
    logging: false,
  };
};

export const AppDataSource = new DataSource(setTypeormConfig(env));
export default AppDataSource;

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import express from 'express';

import { AppModule } from './app.module';
import { EnvironmentVariables } from './common/helper/env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app
    .select(AppModule)
    .get(ConfigService<EnvironmentVariables>);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(express.json());

  app.enableCors({
    // origin: function (
    //   origin: string | undefined,
    //   callback: (err: Error | null, allow?: boolean) => void,
    // ) {
    //   if (!origin && configService.get('NODE_ENV') !== 'production') {
    //     return callback(null, true);
    //   }
    //   if (configService.get('ALLOWED_ORIGINS').includes(origin ?? '')) {
    //     return callback(null, true);
    //   }
    //   console.warn(`[CORS] Origin not allowed: ${origin}`);
    //   return callback(null, false);
    // },
    origin: '*',
    credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(configService.get('PORT'));
  console.log(`Server running on http://localhost:${configService.get('PORT')}/graphql`);
}
bootstrap();

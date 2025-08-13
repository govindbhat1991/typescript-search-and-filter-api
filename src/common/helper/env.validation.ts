import { plainToInstance, Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum NODE_ENVIRONMENT {
  development,
  production,
  test,
}

export class EnvironmentVariables {
  @IsEnum(NODE_ENVIRONMENT)
  NODE_ENV: keyof typeof NODE_ENVIRONMENT;

  @IsString()
  @IsNotEmpty()
  PG_HOST: string;

  @IsString()
  @IsNotEmpty()
  PG_DB: string;

  @IsString()
  @IsNotEmpty()
  PG_USER: string;

  @IsString()
  @IsNotEmpty()
  PG_PASSWORD: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsNotEmpty()
  PG_PORT: number;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsNotEmpty()
  PORT: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim());
    }
    return value;
  })
  @IsArray()
  ALLOWED_ORIGINS: string[];
}

export function envValidation(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

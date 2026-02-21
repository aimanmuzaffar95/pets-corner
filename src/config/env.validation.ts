import { Type, plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

const shouldValidateDatabaseConfig = (env: { NODE_ENV?: NodeEnv }): boolean =>
  env.NODE_ENV !== NodeEnv.Test;

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @ValidateIf(shouldValidateDatabaseConfig)
  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST!: string;

  @ValidateIf(shouldValidateDatabaseConfig)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  POSTGRES_PORT!: number;

  @ValidateIf(shouldValidateDatabaseConfig)
  @IsString()
  @IsNotEmpty()
  POSTGRES_DB!: string;

  @ValidateIf(shouldValidateDatabaseConfig)
  @IsString()
  @IsNotEmpty()
  POSTGRES_USER!: string;

  @ValidateIf(shouldValidateDatabaseConfig)
  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD!: string;

  @ValidateIf(shouldValidateDatabaseConfig)
  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_EXPIRES_IN = '24h';

  @Type(() => Number)
  @IsInt()
  @Min(4)
  @Max(31)
  BCRYPT_SALT_ROUNDS = 12;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => {
        if (error.constraints) {
          return Object.values(error.constraints).join(', ');
        }

        return `${error.property} is invalid`;
      })
      .join('; ');

    throw new Error(`Environment validation failed: ${messages}`);
  }

  return validatedConfig;
}

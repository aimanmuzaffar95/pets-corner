import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DataSourceOptions } from 'typeorm';
import type { EnvironmentVariables } from './env.validation';

export type DatabaseEnv = Pick<
  EnvironmentVariables,
  | 'POSTGRES_HOST'
  | 'POSTGRES_PORT'
  | 'POSTGRES_DB'
  | 'POSTGRES_USER'
  | 'POSTGRES_PASSWORD'
>;

interface DatabaseBuildOptions {
  entities?: DataSourceOptions['entities'];
  migrations?: string[];
}

export function buildDatabaseOptions(
  env: DatabaseEnv,
  options: DatabaseBuildOptions = {},
): DataSourceOptions {
  const { entities = [], migrations = [] } = options;

  return {
    type: 'postgres',
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    synchronize: false,
    entities,
    migrations,
  };
}

export function buildTypeOrmOptions(
  env: DatabaseEnv,
  options: DatabaseBuildOptions = {},
): TypeOrmModuleOptions {
  return {
    ...buildDatabaseOptions(env, options),
    autoLoadEntities: false,
  };
}

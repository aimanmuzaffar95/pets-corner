import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { buildDatabaseOptions } from '../config/database.config';
import { validateEnv } from '../config/env.validation';
import { PetEntity } from '../pet/entities/pet.entity';
import { SpeciesEntity } from '../pet/entities/species.entity';
import { UserEntity } from '../users/entities/user.entity';

loadEnv({ path: process.env.TYPEORM_ENV_FILE ?? '.env.development' });

const env = validateEnv(process.env as Record<string, unknown>);

export default new DataSource(
  buildDatabaseOptions(env, {
    entities: [PetEntity, SpeciesEntity, UserEntity],
    migrations: ['src/database/migrations/*{.ts,.js}'],
  }),
);

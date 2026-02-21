import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { buildTypeOrmOptions } from './config/database.config';
import { validateEnv } from './config/env.validation';
import { PetEntity } from './pet/entities/pet.entity';
import { SpeciesEntity } from './pet/entities/species.entity';
import { PetModule } from './pet/pet.module';
import { UserEntity } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

const isTestEnvironment = process.env.NODE_ENV === 'test';
const envFilePath = isTestEnvironment
  ? ['.env.test', '.env']
  : process.env.NODE_ENV === 'production'
    ? ['.env.production', '.env']
    : ['.env.development', '.env'];

const databaseAndFeatureModules = isTestEnvironment
  ? []
  : [
      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          return buildTypeOrmOptions(
            {
              POSTGRES_HOST: configService.getOrThrow<string>('POSTGRES_HOST'),
              POSTGRES_PORT: Number(
                configService.getOrThrow<string>('POSTGRES_PORT'),
              ),
              POSTGRES_DB: configService.getOrThrow<string>('POSTGRES_DB'),
              POSTGRES_USER: configService.getOrThrow<string>('POSTGRES_USER'),
              POSTGRES_PASSWORD:
                configService.getOrThrow<string>('POSTGRES_PASSWORD'),
            },
            {
              entities: [PetEntity, SpeciesEntity, UserEntity],
            },
          );
        },
      }),
      PetModule,
      UsersModule,
      AuthModule,
    ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      validate: validateEnv,
    }),
    ...databaseAndFeatureModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

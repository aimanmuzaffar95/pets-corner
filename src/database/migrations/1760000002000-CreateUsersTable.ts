import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1760000002000 implements MigrationInterface {
  name = 'CreateUsersTable1760000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar(254) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "first_name" varchar(80) NOT NULL,
        "last_name" varchar(80) NOT NULL,
        "bio" varchar(500),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_users_created_at" ON "users" ("created_at")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_users_created_at"');
    await queryRunner.query('DROP INDEX "public"."UQ_users_email"');
    await queryRunner.query('DROP TABLE "users"');
  }
}

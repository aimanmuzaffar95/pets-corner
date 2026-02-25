import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdoptionListingsTable1760000003000 implements MigrationInterface {
  name = 'CreateAdoptionListingsTable1760000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.query(`
      CREATE TYPE "adoption_listing_status_enum" AS ENUM (
        'DRAFT',
        'PUBLISHED',
        'PAUSED',
        'ADOPTED',
        'WITHDRAWN',
        'EXPIRED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "adoption_listings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "pet_id" uuid NOT NULL,
        "owner_user_id" uuid NOT NULL,
        "status" "adoption_listing_status_enum" NOT NULL DEFAULT 'DRAFT',
        "title" varchar(140) NOT NULL,
        "description" text NOT NULL,
        "adoption_fee_cents" integer,
        "currency" char(3),
        "city" varchar(120) NOT NULL,
        "state" varchar(120) NOT NULL,
        "country" char(2) NOT NULL,
        "published_at" TIMESTAMPTZ,
        "closed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_adoption_listings_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_adoption_listings_fee_non_negative" CHECK (
          "adoption_fee_cents" IS NULL OR "adoption_fee_cents" >= 0
        ),
        CONSTRAINT "CHK_adoption_listings_fee_currency_pair" CHECK (
          (
            "adoption_fee_cents" IS NULL
            AND "currency" IS NULL
          ) OR (
            "adoption_fee_cents" IS NOT NULL
            AND "currency" IS NOT NULL
          )
        ),
        CONSTRAINT "CHK_adoption_listings_currency_format" CHECK (
          "currency" IS NULL OR "currency" ~ '^[A-Z]{3}$'
        ),
        CONSTRAINT "CHK_adoption_listings_country_format" CHECK (
          "country" ~ '^[A-Z]{2}$'
        )
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_adoption_listings_pet_id" ON "adoption_listings" ("pet_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_adoption_listings_owner_user_id" ON "adoption_listings" ("owner_user_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_adoption_listings_status_created_at" ON "adoption_listings" ("status", "created_at" DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_adoption_listings_city_state_status" ON "adoption_listings" ("city", "state", "status")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_adoption_listings_status_pet_id" ON "adoption_listings" ("status", "pet_id")',
    );

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_adoption_listings_active_pet"
      ON "adoption_listings" ("pet_id")
      WHERE "status" IN ('DRAFT', 'PUBLISHED', 'PAUSED')
      AND "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "adoption_listings"
      ADD CONSTRAINT "FK_adoption_listings_pet_id"
      FOREIGN KEY ("pet_id")
      REFERENCES "pets"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "adoption_listings"
      ADD CONSTRAINT "FK_adoption_listings_owner_user_id"
      FOREIGN KEY ("owner_user_id")
      REFERENCES "users"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "adoption_listings" DROP CONSTRAINT "FK_adoption_listings_owner_user_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "adoption_listings" DROP CONSTRAINT "FK_adoption_listings_pet_id"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."UQ_adoption_listings_active_pet"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_adoption_listings_status_pet_id"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_adoption_listings_city_state_status"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_adoption_listings_status_created_at"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_adoption_listings_owner_user_id"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_adoption_listings_pet_id"',
    );
    await queryRunner.query('DROP TABLE "adoption_listings"');
    await queryRunner.query('DROP TYPE "adoption_listing_status_enum"');
  }
}

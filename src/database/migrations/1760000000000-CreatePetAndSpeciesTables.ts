import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePetAndSpeciesTables1760000000000 implements MigrationInterface {
  name = 'CreatePetAndSpeciesTables1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.query(`
      CREATE TABLE "species" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" varchar(32) NOT NULL,
        "label" varchar(64) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_species_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_species_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "pets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(120) NOT NULL,
        "breed" varchar(120),
        "age" integer,
        "species_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_pets_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_pets_age_non_negative" CHECK ("age" IS NULL OR "age" >= 0)
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_pets_species_id" ON "pets" ("species_id")',
    );
    await queryRunner.query('CREATE INDEX "IDX_pets_name" ON "pets" ("name")');

    await queryRunner.query(`
      ALTER TABLE "pets"
      ADD CONSTRAINT "FK_pets_species_id"
      FOREIGN KEY ("species_id")
      REFERENCES "species"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "pets" DROP CONSTRAINT "FK_pets_species_id"',
    );
    await queryRunner.query('DROP INDEX "public"."IDX_pets_name"');
    await queryRunner.query('DROP INDEX "public"."IDX_pets_species_id"');
    await queryRunner.query('DROP TABLE "pets"');
    await queryRunner.query('DROP TABLE "species"');
  }
}

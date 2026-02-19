import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSpeciesLookup1760000001000 implements MigrationInterface {
  name = 'SeedSpeciesLookup1760000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "species" ("code", "label")
      VALUES
        ('DOG', 'Dog'),
        ('CAT', 'Cat'),
        ('BIRD', 'Bird'),
        ('OTHER', 'Other')
      ON CONFLICT ("code") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "species"
      WHERE "code" IN ('DOG', 'CAT', 'BIRD', 'OTHER')
    `);
  }
}

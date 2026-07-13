import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Kept as a no-op so databases that already recorded this historical
 * migration remain compatible. Development users now live in the explicit
 * development seeder and are never created by production migrations.
 */
export class SeedTestUsers1783866073542 implements MigrationInterface {
  name = 'SeedTestUsers1783866073542';

  async up(_queryRunner: QueryRunner): Promise<void> {}

  async down(_queryRunner: QueryRunner): Promise<void> {}
}

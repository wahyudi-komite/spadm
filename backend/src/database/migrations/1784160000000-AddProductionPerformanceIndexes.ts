import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductionPerformanceIndexes1784160000000 implements MigrationInterface {
  name = 'AddProductionPerformanceIndexes1784160000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IDX_delivery_processing_lease ON notification_deliveries (status, updatedAt)',
    );
    await queryRunner.query(
      'CREATE INDEX IDX_distributions_date_order ON distributions (distributed_at, order_id)',
    );
    await queryRunner.query(
      'CREATE INDEX IDX_orders_created ON bazaar_orders (created_at)',
    );
    await queryRunner.query(
      'CREATE INDEX IDX_orders_area_status_created ON bazaar_orders (distribution_area_id, status, created_at)',
    );
    await queryRunner.query(
      'CREATE INDEX IDX_orders_event_created ON bazaar_orders (event_id, created_at)',
    );
    await queryRunner.query(
      'CREATE INDEX IDX_payments_created_status ON payments (created_at, status)',
    );
    await queryRunner.query(
      'CREATE INDEX IDX_payments_status_paid ON payments (status, paid_at)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IDX_payments_status_paid ON payments');
    await queryRunner.query(
      'DROP INDEX IDX_payments_created_status ON payments',
    );
    await queryRunner.query(
      'DROP INDEX IDX_orders_event_created ON bazaar_orders',
    );
    await queryRunner.query(
      'DROP INDEX IDX_orders_area_status_created ON bazaar_orders',
    );
    await queryRunner.query('DROP INDEX IDX_orders_created ON bazaar_orders');
    await queryRunner.query(
      'DROP INDEX IDX_distributions_date_order ON distributions',
    );
    await queryRunner.query(
      'DROP INDEX IDX_delivery_processing_lease ON notification_deliveries',
    );
  }
}

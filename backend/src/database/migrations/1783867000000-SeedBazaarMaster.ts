import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedBazaarMaster1783867000000 implements MigrationInterface {
  name = 'SeedBazaarMaster1783867000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const memberPermissions = [
      'bazaar.event.read',
      'bazaar.batch.read',
      'bazaar.product.read',
      'bazaar.order.read',
      'bazaar.order.create',
    ];

    await queryRunner.query(
      `INSERT IGNORE INTO role_permissions (roleId, permissionId)
       SELECT roles.id, permissions.id
       FROM roles
       CROSS JOIN permissions
       WHERE roles.name = 'MEMBER' AND permissions.name IN (?)`,
      [memberPermissions],
    );

    await queryRunner.query(
      `INSERT IGNORE INTO role_permissions (roleId, permissionId)
       SELECT roles.id, permissions.id
       FROM roles
       CROSS JOIN permissions
       WHERE roles.name = 'BAZAAR_ADMIN' AND permissions.name = 'settings.manage'`,
    );

    const areas = ['P1', 'P2', 'P3', 'P4', 'P5', 'PC', 'HO'];
    for (const code of areas) {
      await queryRunner.query(
        `INSERT INTO distribution_areas (code, name, is_active)
         VALUES (?, ?, true)
         ON DUPLICATE KEY UPDATE name = VALUES(name), is_active = true`,
        [code, `Area ${code}`],
      );
    }

    await queryRunner.query(
      `INSERT INTO bazaar_events
        (code, name, description, subsidy, goodie_bag_fee, application_fee, isActive)
       VALUES
        ('BZR21', 'Bazar HUT SPADM ke-21', 'Program bazar anggota dalam rangka HUT SPADM ke-21', 20000, 3000, 1000, true)
       ON DUPLICATE KEY UPDATE
        name = VALUES(name), subsidy = VALUES(subsidy),
        goodie_bag_fee = VALUES(goodie_bag_fee), application_fee = VALUES(application_fee)`,
    );

    const [event] = await queryRunner.query(
      `SELECT id FROM bazaar_events WHERE code = 'BZR21' LIMIT 1`,
    );

    for (const name of ['Batch 1', 'Batch 2']) {
      const existing = await queryRunner.query(
        `SELECT id FROM bazaar_batches WHERE event_id = ? AND name = ? AND deleted_at IS NULL LIMIT 1`,
        [event.id, name],
      );
      if (existing.length === 0) {
        await queryRunner.query(
          `INSERT INTO bazaar_batches (event_id, name, status, is_purchase_enabled)
           VALUES (?, ?, 'DRAFT', false)`,
          [event.id, name],
        );
      }
    }

    const products = [
      { name: 'Minyak', slug: 'minyak', sku: 'BZR21-MINYAK', price: 50000 },
      { name: 'Beras', slug: 'beras', sku: 'BZR21-BERAS', price: 75000 },
      { name: 'Gula', slug: 'gula', sku: 'BZR21-GULA', price: 30000 },
    ];
    for (const product of products) {
      await queryRunner.query(
        `INSERT INTO bazaar_products
          (event_id, name, slug, sku, normal_price, selling_price,
           maximum_quantity_per_member, inventory_mode, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1, 'UNLIMITED', true)
         ON DUPLICATE KEY UPDATE
          name = VALUES(name), normal_price = VALUES(normal_price),
          selling_price = VALUES(selling_price), is_active = true`,
        [
          event.id,
          product.name,
          product.slug,
          product.sku,
          product.price,
          product.price,
        ],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM bazaar_products WHERE slug IN ('minyak','beras','gula')`,
    );
    await queryRunner.query(
      `DELETE FROM bazaar_batches WHERE event_id IN (SELECT id FROM bazaar_events WHERE code = 'BZR21')`,
    );
    await queryRunner.query(`DELETE FROM bazaar_events WHERE code = 'BZR21'`);
    await queryRunner.query(
      `DELETE FROM distribution_areas WHERE code IN ('P1','P2','P3','P4','P5','PC','HO')`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRolesPermissions1783865586045 implements MigrationInterface {
  name = 'SeedRolesPermissions1783865586045';

  async up(queryRunner: QueryRunner): Promise<void> {
    const permissions = [
      {
        name: 'member.read',
        group: 'member',
        description: 'Melihat daftar anggota',
      },
      {
        name: 'member.create',
        group: 'member',
        description: 'Menambah anggota',
      },
      {
        name: 'member.update',
        group: 'member',
        description: 'Mengubah anggota',
      },
      {
        name: 'member.import',
        group: 'member',
        description: 'Import anggota Excel',
      },
      {
        name: 'member.reset_password',
        group: 'member',
        description: 'Reset password anggota',
      },
      {
        name: 'member.assign_role',
        group: 'member',
        description: 'Assign role ke anggota',
      },
      { name: 'role.read', group: 'role', description: 'Melihat daftar role' },
      { name: 'role.create', group: 'role', description: 'Membuat role' },
      { name: 'role.update', group: 'role', description: 'Mengubah role' },
      {
        name: 'role.assign',
        group: 'role',
        description: 'Assign role ke user',
      },
      { name: 'role.delete', group: 'role', description: 'Menghapus role' },
      {
        name: 'bazaar.event.read',
        group: 'bazaar.event',
        description: 'Melihat event',
      },
      {
        name: 'bazaar.event.create',
        group: 'bazaar.event',
        description: 'Membuat event',
      },
      {
        name: 'bazaar.event.update',
        group: 'bazaar.event',
        description: 'Mengubah event',
      },
      {
        name: 'bazaar.batch.read',
        group: 'bazaar.batch',
        description: 'Melihat batch',
      },
      {
        name: 'bazaar.batch.create',
        group: 'bazaar.batch',
        description: 'Membuat batch',
      },
      {
        name: 'bazaar.batch.open',
        group: 'bazaar.batch',
        description: 'Membuka batch',
      },
      {
        name: 'bazaar.batch.close',
        group: 'bazaar.batch',
        description: 'Menutup batch',
      },
      {
        name: 'bazaar.batch.distribute',
        group: 'bazaar.batch',
        description: 'Distribusi batch',
      },
      {
        name: 'bazaar.product.read',
        group: 'bazaar.product',
        description: 'Melihat produk',
      },
      {
        name: 'bazaar.product.create',
        group: 'bazaar.product',
        description: 'Membuat produk',
      },
      {
        name: 'bazaar.product.update',
        group: 'bazaar.product',
        description: 'Mengubah produk',
      },
      {
        name: 'bazaar.product.delete',
        group: 'bazaar.product',
        description: 'Menghapus produk',
      },
      {
        name: 'bazaar.order.read',
        group: 'bazaar.order',
        description: 'Melihat order',
      },
      {
        name: 'bazaar.order.create',
        group: 'bazaar.order',
        description: 'Membuat order',
      },
      {
        name: 'bazaar.order.cancel',
        group: 'bazaar.order',
        description: 'Membatalkan order',
      },
      {
        name: 'bazaar.payment.read',
        group: 'bazaar.payment',
        description: 'Melihat payment',
      },
      {
        name: 'bazaar.payment.manual_verify',
        group: 'bazaar.payment',
        description: 'Verifikasi manual payment',
      },
      {
        name: 'bazaar.distribution.read',
        group: 'bazaar.distribution',
        description: 'Melihat distribusi',
      },
      {
        name: 'bazaar.distribution.scan',
        group: 'bazaar.distribution',
        description: 'Scan distribusi',
      },
      {
        name: 'bazaar.distribution.confirm',
        group: 'bazaar.distribution',
        description: 'Konfirmasi distribusi',
      },
      {
        name: 'bazaar.report.read',
        group: 'bazaar.report',
        description: 'Melihat laporan',
      },
      {
        name: 'bazaar.report.export',
        group: 'bazaar.report',
        description: 'Export laporan',
      },
      {
        name: 'finance.dashboard.read',
        group: 'finance.dashboard',
        description: 'Melihat dashboard finance',
      },
      { name: 'audit.read', group: 'audit', description: 'Melihat audit log' },
      {
        name: 'settings.manage',
        group: 'settings',
        description: 'Mengelola pengaturan',
      },
    ];

    for (const p of permissions) {
      await queryRunner.query(
        `INSERT INTO permissions (name, \`group\`, description) VALUES (?, ?, ?)`,
        [p.name, p.group, p.description],
      );
    }

    const roles = [
      'SUPER_ADMIN',
      'BAZAAR_ADMIN',
      'FINANCE_ADMIN',
      'AREA_PIC',
      'LEADERSHIP',
      'MEMBER',
    ];
    for (const name of roles) {
      await queryRunner.query(
        `INSERT INTO roles (name, description, isSystem) VALUES (?, ?, ?)`,
        [name, `Role ${name}`, name !== 'MEMBER'],
      );
    }

    await this.grantPermissions(queryRunner, 'SUPER_ADMIN', '1 = 1');
    await this.grantPermissions(
      queryRunner,
      'BAZAAR_ADMIN',
      '(p.name LIKE ? OR p.name = ?)',
      ['bazaar.%', 'member.read'],
    );
    await this.grantPermissions(
      queryRunner,
      'FINANCE_ADMIN',
      '(p.name LIKE ? OR p.name LIKE ? OR p.name LIKE ?)',
      ['finance.%', 'bazaar.payment.%', 'bazaar.report.%'],
    );
    await this.grantPermissions(queryRunner, 'AREA_PIC', 'p.name IN (?, ?)', [
      'bazaar.distribution.scan',
      'bazaar.distribution.confirm',
    ]);
    await this.grantPermissions(queryRunner, 'LEADERSHIP', 'p.name IN (?, ?)', [
      'bazaar.report.read',
      'finance.dashboard.read',
    ]);
    await this.grantPermissions(queryRunner, 'MEMBER', 'p.name IN (?, ?)', [
      'bazaar.order.create',
      'bazaar.order.read',
    ]);

    await queryRunner.query(
      `INSERT INTO user_roles (userId, roleId, assignedBy, assignedAt)
       SELECT u.id, r.id, NULL, NOW()
       FROM users u
       CROSS JOIN roles r
       WHERE u.npk IN (?, ?) AND r.name = ?
       AND NOT EXISTS (
         SELECT 1 FROM user_roles ur
         WHERE ur.userId = u.id AND ur.roleId = r.id AND ur.revokedAt IS NULL
       )`,
      ['23893', '15012', 'SUPER_ADMIN'],
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM user_role_histories`);
    await queryRunner.query(`DELETE FROM user_roles`);
    await queryRunner.query(`DELETE FROM role_permissions`);
    await queryRunner.query(`DELETE FROM permissions`);
    await queryRunner.query(`DELETE FROM roles`);
  }

  private async grantPermissions(
    queryRunner: QueryRunner,
    roleName: string,
    permissionCondition: string,
    permissionParameters: string[] = [],
  ): Promise<void> {
    await queryRunner.query(
      `INSERT IGNORE INTO role_permissions (roleId, permissionId)
       SELECT r.id, p.id
       FROM roles r
       CROSS JOIN permissions p
       WHERE r.name = ? AND (${permissionCondition})`,
      [roleName, ...permissionParameters],
    );
  }
}

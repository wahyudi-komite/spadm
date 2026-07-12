import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRolesPermissions1712345678 implements MigrationInterface {
  name = 'SeedRolesPermissions1712345678';

  async up(queryRunner: QueryRunner): Promise<void> {
    const permissions = [
      { name: 'member.read', group: 'member', description: 'Melihat daftar anggota' },
      { name: 'member.create', group: 'member', description: 'Menambah anggota' },
      { name: 'member.update', group: 'member', description: 'Mengubah anggota' },
      { name: 'member.import', group: 'member', description: 'Import anggota Excel' },
      { name: 'member.reset_password', group: 'member', description: 'Reset password anggota' },
      { name: 'member.assign_role', group: 'member', description: 'Assign role ke anggota' },
      { name: 'role.read', group: 'role', description: 'Melihat daftar role' },
      { name: 'role.create', group: 'role', description: 'Membuat role' },
      { name: 'role.update', group: 'role', description: 'Mengubah role' },
      { name: 'role.assign', group: 'role', description: 'Assign role ke user' },
      { name: 'bazaar.event.read', group: 'bazaar.event', description: 'Melihat event' },
      { name: 'bazaar.event.create', group: 'bazaar.event', description: 'Membuat event' },
      { name: 'bazaar.event.update', group: 'bazaar.event', description: 'Mengubah event' },
      { name: 'bazaar.batch.read', group: 'bazaar.batch', description: 'Melihat batch' },
      { name: 'bazaar.batch.create', group: 'bazaar.batch', description: 'Membuat batch' },
      { name: 'bazaar.batch.open', group: 'bazaar.batch', description: 'Membuka batch' },
      { name: 'bazaar.batch.close', group: 'bazaar.batch', description: 'Menutup batch' },
      { name: 'bazaar.batch.distribute', group: 'bazaar.batch', description: 'Distribusi batch' },
      { name: 'bazaar.product.read', group: 'bazaar.product', description: 'Melihat produk' },
      { name: 'bazaar.product.create', group: 'bazaar.product', description: 'Membuat produk' },
      { name: 'bazaar.product.update', group: 'bazaar.product', description: 'Mengubah produk' },
      { name: 'bazaar.product.delete', group: 'bazaar.product', description: 'Menghapus produk' },
      { name: 'bazaar.order.read', group: 'bazaar.order', description: 'Melihat order' },
      { name: 'bazaar.order.create', group: 'bazaar.order', description: 'Membuat order' },
      { name: 'bazaar.order.cancel', group: 'bazaar.order', description: 'Membatalkan order' },
      { name: 'bazaar.payment.read', group: 'bazaar.payment', description: 'Melihat payment' },
      { name: 'bazaar.payment.manual_verify', group: 'bazaar.payment', description: 'Verifikasi manual payment' },
      { name: 'bazaar.distribution.read', group: 'bazaar.distribution', description: 'Melihat distribusi' },
      { name: 'bazaar.distribution.scan', group: 'bazaar.distribution', description: 'Scan distribusi' },
      { name: 'bazaar.distribution.confirm', group: 'bazaar.distribution', description: 'Konfirmasi distribusi' },
      { name: 'bazaar.report.read', group: 'bazaar.report', description: 'Melihat laporan' },
      { name: 'bazaar.report.export', group: 'bazaar.report', description: 'Export laporan' },
      { name: 'finance.dashboard.read', group: 'finance.dashboard', description: 'Melihat dashboard finance' },
      { name: 'audit.read', group: 'audit', description: 'Melihat audit log' },
      { name: 'settings.manage', group: 'settings', description: 'Mengelola pengaturan' },
    ];

    for (const p of permissions) {
      await queryRunner.query(
        `INSERT INTO permissions (name, \`group\`, description) VALUES (?, ?, ?)`,
        [p.name, p.group, p.description],
      );
    }

    const roles = ['SUPER_ADMIN', 'BAZAAR_ADMIN', 'FINANCE_ADMIN', 'AREA_PIC', 'LEADERSHIP', 'MEMBER'];
    for (const name of roles) {
      await queryRunner.query(
        `INSERT INTO roles (name, description, isSystem) VALUES (?, ?, ?)`,
        [name, `Role ${name}`, name !== 'MEMBER'],
      );
    }

    const allPerms = await queryRunner.query(`SELECT id FROM permissions`);
    for (const p of allPerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (1, ?)`, [p.id]);
    }

    const bazaarPerms = await queryRunner.query(
      `SELECT id FROM permissions WHERE name LIKE 'bazaar.%' OR name = 'member.read'`
    );
    for (const p of bazaarPerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (2, ?)`, [p.id]);
    }

    const financePerms = await queryRunner.query(
      `SELECT id FROM permissions WHERE name LIKE 'finance.%' OR name LIKE 'bazaar.payment.%' OR name LIKE 'bazaar.report.%'`
    );
    for (const p of financePerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (3, ?)`, [p.id]);
    }

    const areaPerms = await queryRunner.query(
      `SELECT id FROM permissions WHERE name IN ('bazaar.distribution.scan', 'bazaar.distribution.confirm')`
    );
    for (const p of areaPerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (4, ?)`, [p.id]);
    }

    const leadershipPerms = await queryRunner.query(
      `SELECT id FROM permissions WHERE name IN ('bazaar.report.read', 'finance.dashboard.read')`
    );
    for (const p of leadershipPerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (5, ?)`, [p.id]);
    }

    const memberPerms = await queryRunner.query(
      `SELECT id FROM permissions WHERE name IN ('bazaar.order.create', 'bazaar.order.read')`
    );
    for (const p of memberPerms) {
      await queryRunner.query(`INSERT INTO role_permissions (roleId, permissionId) VALUES (6, ?)`, [p.id]);
    }

    const superAdminRoleId = 1;
    const users = await queryRunner.query(
      `SELECT id FROM users WHERE npk IN ('23893', '15012')`
    );
    for (const user of users) {
      await queryRunner.query(
        `INSERT INTO user_roles (userId, roleId, assignedBy, assignedAt) VALUES (?, ?, 1, NOW())`,
        [user.id, superAdminRoleId],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM user_role_histories`);
    await queryRunner.query(`DELETE FROM user_roles`);
    await queryRunner.query(`DELETE FROM role_permissions`);
    await queryRunner.query(`DELETE FROM permissions`);
    await queryRunner.query(`DELETE FROM roles`);
  }
}

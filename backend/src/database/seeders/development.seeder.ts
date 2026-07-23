import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';

const developmentUsers = [
  { npk: '10001', name: 'Admin Bazar', roleName: 'BAZAAR_ADMIN' },
  { npk: '10002', name: 'Admin Finance', roleName: 'FINANCE_ADMIN' },
  { npk: '10003', name: 'PIC Area', roleName: 'AREA_PIC' },
  { npk: '10004', name: 'Pimpinan', roleName: 'LEADERSHIP' },
  { npk: '10005', name: 'Anggota Biasa', roleName: 'MEMBER' },
];

async function seedDevelopment(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Development seeder hanya boleh dijalankan dengan NODE_ENV=development');
  }

  await dataSource.initialize();
  const passwordHash = await bcrypt.hash(
    process.env.DEFAULT_MEMBER_PASSWORD || 'SmartCare',
    12,
  );

  await dataSource.transaction(async (manager) => {
    for (const seed of developmentUsers) {
      await manager.query(
        `INSERT INTO members (npk, name, status)
         VALUES (?, ?, 'active')
         ON DUPLICATE KEY UPDATE name = VALUES(name), status = 'active'`,
        [seed.npk, seed.name],
      );

      const [member] = await manager.query(
        'SELECT id FROM members WHERE npk = ? LIMIT 1',
        [seed.npk],
      );

      await manager.query(
        `UPDATE members
         SET password = ?, mustChangePassword = true, isActive = true
         WHERE id = ? AND (password IS NULL OR password = '' OR password != ?)`,
        [passwordHash, member.id, passwordHash],
      );

      const [role] = await manager.query(
        'SELECT id FROM roles WHERE name = ? LIMIT 1',
        [seed.roleName],
      );

      if (!role) {
        throw new Error(`Role ${seed.roleName} belum tersedia. Jalankan migration terlebih dahulu.`);
      }

      const [activeAssignment] = await manager.query(
        `SELECT id FROM user_roles
         WHERE memberId = ? AND roleId = ? AND revokedAt IS NULL
         LIMIT 1`,
        [member.id, role.id],
      );

      if (!activeAssignment) {
        await manager.query(
          `INSERT INTO user_roles (memberId, roleId, assignedBy, assignedAt)
           VALUES (?, ?, ?, NOW())`,
          [member.id, role.id, member.id],
        );
      }
    }
  });

  await dataSource.destroy();
}

seedDevelopment().catch(async (error: unknown) => {
  if (dataSource.isInitialized) await dataSource.destroy();
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Development seed gagal: ${message}`);
  process.exit(1);
});

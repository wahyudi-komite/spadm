import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTestUsers1783866073542 implements MigrationInterface {
  name = 'SeedTestUsers1783866073542';

  async up(queryRunner: QueryRunner): Promise<void> {
    const hash = '$2b$12$Me0oYBABJgG9TtDjsrX/Wuo4ePsH71.Q8FGYoUikuw79faWs7Ft5a';

    const testUsers = [
      { npk: '10001', name: 'Admin Bazar', roleName: 'BAZAAR_ADMIN', mustChange: false },
      { npk: '10002', name: 'Admin Finance', roleName: 'FINANCE_ADMIN', mustChange: false },
      { npk: '10003', name: 'PIC Area', roleName: 'AREA_PIC', mustChange: false },
      { npk: '10004', name: 'Pimpinan', roleName: 'LEADERSHIP', mustChange: false },
      { npk: '10005', name: 'Anggota Biasa', roleName: 'MEMBER', mustChange: true },
    ];

    for (const u of testUsers) {
      const memberResult = await queryRunner.query(
        `INSERT INTO members (npk, name, status) VALUES (?, ?, 'active')`,
        [u.npk, u.name],
      );
      const memberId = memberResult.insertId;

      const userResult = await queryRunner.query(
        `INSERT INTO users (npk, password, mustChangePassword, isActive, memberId) VALUES (?, ?, ?, true, ?)`,
        [u.npk, hash, u.mustChange, memberId],
      );
      const userId = userResult.insertId;

      const role = await queryRunner.query(
        `SELECT id FROM roles WHERE name = ?`,
        [u.roleName],
      );
      const roleId = role[0].id;

      await queryRunner.query(
        `INSERT INTO user_roles (userId, roleId, assignedBy, assignedAt) VALUES (?, ?, 1, NOW())`,
        [userId, roleId],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM user_roles WHERE userId IN (SELECT id FROM users WHERE npk IN ('10001','10002','10003','10004','10005'))`);
    await queryRunner.query(`DELETE FROM users WHERE npk IN ('10001','10002','10003','10004','10005')`);
    await queryRunner.query(`DELETE FROM members WHERE npk IN ('10001','10002','10003','10004','10005')`);
  }
}

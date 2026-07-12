import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSuperAdminUsers1783866342506 implements MigrationInterface {
  name = 'SeedSuperAdminUsers1783866342506';

  async up(queryRunner: QueryRunner): Promise<void> {
    const hash = '$2b$12$Me0oYBABJgG9TtDjsrX/Wuo4ePsH71.Q8FGYoUikuw79faWs7Ft5a';

    const superAdmins = [
      { npk: '23893', name: 'Super Admin 1' },
      { npk: '15012', name: 'Super Admin 2' },
    ];

    for (const u of superAdmins) {
      const existingUser = await queryRunner.query(`SELECT id FROM users WHERE npk = ?`, [u.npk]);
      if (existingUser.length > 0) continue;

      const memberResult = await queryRunner.query(
        `INSERT INTO members (npk, name, status) VALUES (?, ?, 'active')`,
        [u.npk, u.name],
      );
      const memberId = memberResult.insertId;

      const userResult = await queryRunner.query(
        `INSERT INTO users (npk, password, mustChangePassword, isActive, memberId) VALUES (?, ?, false, true, ?)`,
        [u.npk, hash, memberId],
      );
      const userId = userResult.insertId;

      const role = await queryRunner.query(`SELECT id FROM roles WHERE name = 'SUPER_ADMIN'`);
      const roleId = role[0].id;

      const existingMember = await queryRunner.query(
        `SELECT id FROM user_roles WHERE userId = ? AND roleId = ?`,
        [userId, roleId],
      );
      if (existingMember.length === 0) {
        await queryRunner.query(
          `INSERT INTO user_roles (userId, roleId, assignedBy, assignedAt) VALUES (?, ?, 1, NOW())`,
          [userId, roleId],
        );
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM user_roles WHERE userId IN (SELECT id FROM users WHERE npk IN ('23893','15012'))`);
    await queryRunner.query(`DELETE FROM users WHERE npk IN ('23893','15012')`);
    await queryRunner.query(`DELETE FROM members WHERE npk IN ('23893','15012')`);
  }
}

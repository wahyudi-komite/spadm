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
      const existingMember = await queryRunner.query(`SELECT id FROM members WHERE npk = ?`, [u.npk]);
      if (existingMember.length > 0) continue;

      const memberResult = await queryRunner.query(
        `INSERT INTO members (npk, name, status, password, mustChangePassword, isActive) VALUES (?, ?, 'active', ?, true, true)`,
        [u.npk, u.name, hash],
      );
      const memberId = memberResult.insertId;

      const role = await queryRunner.query(`SELECT id FROM roles WHERE name = 'SUPER_ADMIN'`);
      const roleId = role[0].id;

      const existingAssignment = await queryRunner.query(
        `SELECT id FROM user_roles WHERE memberId = ? AND roleId = ? AND revokedAt IS NULL`,
        [memberId, roleId],
      );
      if (existingAssignment.length === 0) {
        await queryRunner.query(
          `INSERT INTO user_roles (memberId, roleId, assignedBy, assignedAt) VALUES (?, ?, 1, NOW())`,
          [memberId, roleId],
        );
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const memberIds = await queryRunner.query(
      `SELECT id FROM members WHERE npk IN ('23893','15012')`,
    );
    for (const m of memberIds) {
      await queryRunner.query(`DELETE FROM user_roles WHERE memberId = ?`, [m.id]);
    }
    await queryRunner.query(`DELETE FROM members WHERE npk IN ('23893','15012')`);
  }
}

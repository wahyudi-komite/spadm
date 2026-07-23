import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUsersTable1784300000000 implements MigrationInterface {
  name = 'DropUsersTable1784300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE bazaar_orders ADD CONSTRAINT FK_bazaar_orders_member FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE distribution_histories ADD CONSTRAINT FK_distribution_histories_member FOREIGN KEY (performedBy) REFERENCES members(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE distributions ADD CONSTRAINT FK_distributions_member FOREIGN KEY (distributed_by) REFERENCES members(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE manual_payment_verifications ADD CONSTRAINT FK_manual_payment_verifications_member FOREIGN KEY (verifiedBy) REFERENCES members(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE member_imports ADD CONSTRAINT FK_member_imports_uploader FOREIGN KEY (uploadedBy) REFERENCES members(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE member_imports ADD CONSTRAINT FK_member_imports_confirmer FOREIGN KEY (confirmedBy) REFERENCES members(id) ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE notifications ADD CONSTRAINT FK_notifications_member FOREIGN KEY (userId) REFERENCES members(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE sessions ADD CONSTRAINT FK_sessions_member FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE user_role_histories ADD CONSTRAINT FK_user_role_histories_member FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE user_roles ADD CONSTRAINT FK_user_roles_member FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE`);

    await queryRunner.query(`ALTER TABLE user_roles ADD COLUMN active_uq VARCHAR(50) GENERATED ALWAYS AS (IF(revokedAt IS NULL, CONCAT(memberId, '-', roleId, '-', COALESCE(areaId, 0)), NULL)) VIRTUAL`);
    await queryRunner.query(`CREATE UNIQUE INDEX UQ_user_roles_active ON user_roles (active_uq)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX UQ_user_roles_active ON user_roles`);
    await queryRunner.query(`ALTER TABLE user_roles DROP COLUMN active_uq`);

    await queryRunner.query(`ALTER TABLE bazaar_orders DROP FOREIGN KEY FK_bazaar_orders_member`);
    await queryRunner.query(`ALTER TABLE distribution_histories DROP FOREIGN KEY FK_distribution_histories_member`);
    await queryRunner.query(`ALTER TABLE distributions DROP FOREIGN KEY FK_distributions_member`);
    await queryRunner.query(`ALTER TABLE manual_payment_verifications DROP FOREIGN KEY FK_manual_payment_verifications_member`);
    await queryRunner.query(`ALTER TABLE member_imports DROP FOREIGN KEY FK_member_imports_uploader`);
    await queryRunner.query(`ALTER TABLE member_imports DROP FOREIGN KEY FK_member_imports_confirmer`);
    await queryRunner.query(`ALTER TABLE notifications DROP FOREIGN KEY FK_notifications_member`);
    await queryRunner.query(`ALTER TABLE sessions DROP FOREIGN KEY FK_sessions_member`);
    await queryRunner.query(`ALTER TABLE user_role_histories DROP FOREIGN KEY FK_user_role_histories_member`);
    await queryRunner.query(`ALTER TABLE user_roles DROP FOREIGN KEY FK_user_roles_member`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT,
      npk VARCHAR(10) NOT NULL,
      password VARCHAR(255) NOT NULL,
      mustChangePassword TINYINT NOT NULL DEFAULT 0,
      isActive TINYINT NOT NULL DEFAULT 1,
      failedLoginAttempts INT NOT NULL DEFAULT 0,
      lockedUntil DATETIME NULL,
      lastLoginAt DATETIME NULL,
      memberId INT NULL,
      createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      PRIMARY KEY (id),
      KEY IDX_users_npk (npk),
      CONSTRAINT FK_users_member FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE SET NULL
    ) ENGINE=InnoDB`);

    await queryRunner.query(`INSERT INTO users (npk, password, mustChangePassword, isActive, failedLoginAttempts, lockedUntil, lastLoginAt, memberId) SELECT npk, COALESCE(password, ''), COALESCE(mustChangePassword, 0), COALESCE(isActive, 1), COALESCE(failedLoginAttempts, 0), lockedUntil, lastLoginAt, id FROM members`);

    await queryRunner.query(`ALTER TABLE bazaar_orders ADD CONSTRAINT FK_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE distribution_histories ADD CONSTRAINT FK_distribution_history_user FOREIGN KEY (performedBy) REFERENCES users(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE distributions ADD CONSTRAINT FK_distributions_user FOREIGN KEY (distributed_by) REFERENCES users(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE manual_payment_verifications ADD CONSTRAINT FK_manual_verified_by FOREIGN KEY (verifiedBy) REFERENCES users(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE member_imports ADD CONSTRAINT FK_member_import_uploader FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE member_imports ADD CONSTRAINT FK_member_import_confirmer FOREIGN KEY (confirmedBy) REFERENCES users(id) ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE notifications ADD CONSTRAINT FK_notification_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE sessions ADD CONSTRAINT FK_sessions_user FOREIGN KEY (memberId) REFERENCES users(id) ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE user_role_histories ADD CONSTRAINT FK_user_role_history_user FOREIGN KEY (memberId) REFERENCES users(id) ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE user_roles ADD CONSTRAINT FK_user_roles_user FOREIGN KEY (memberId) REFERENCES users(id) ON DELETE CASCADE`);
  }
}

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserRoleHistoryAssignmentFields1784246400000
  implements MigrationInterface
{
  name = 'AddUserRoleHistoryAssignmentFields1784246400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      new TableColumn({ name: 'areaId', type: 'int', isNullable: true }),
      new TableColumn({ name: 'startsAt', type: 'datetime', isNullable: true }),
      new TableColumn({ name: 'endsAt', type: 'datetime', isNullable: true }),
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '20',
        isNullable: false,
        default: "'ACTIVE'",
      }),
    ];

    for (const column of columns) {
      if (!(await queryRunner.hasColumn('user_role_histories', column.name))) {
        await queryRunner.addColumn('user_role_histories', column);
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const columnName of ['status', 'endsAt', 'startsAt', 'areaId']) {
      if (await queryRunner.hasColumn('user_role_histories', columnName)) {
        await queryRunner.dropColumn('user_role_histories', columnName);
      }
    }
  }
}

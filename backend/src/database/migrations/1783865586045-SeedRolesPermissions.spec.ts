import type { QueryRunner } from 'typeorm';
import { SeedRolesPermissions1783865586045 } from './1783865586045-SeedRolesPermissions';

describe('SeedRolesPermissions1783865586045', () => {
  it('resolves role IDs by name instead of assuming numeric IDs', async () => {
    const query = jest
      .fn<Promise<unknown>, [sql: string, parameters?: unknown[]]>()
      .mockResolvedValue([]);
    const queryRunner = { query } as unknown as QueryRunner;

    await new SeedRolesPermissions1783865586045().up(queryRunner);

    const permissionQueries = query.mock.calls.filter(([sql]) =>
      String(sql).includes('INSERT IGNORE INTO role_permissions'),
    );
    expect(permissionQueries).toHaveLength(6);
    expect(permissionQueries.map(([, parameters]) => parameters?.[0])).toEqual([
      'SUPER_ADMIN',
      'BAZAAR_ADMIN',
      'FINANCE_ADMIN',
      'AREA_PIC',
      'LEADERSHIP',
      'MEMBER',
    ]);

    const combinedSql = query.mock.calls.map(([sql]) => String(sql)).join('\n');
    expect(combinedSql).not.toMatch(
      /role_permissions \(roleId, permissionId\) VALUES \([1-6],/,
    );
    expect(combinedSql).toContain('r.name = ?');
    expect(combinedSql).toContain('ur.roleId = r.id');
  });
});

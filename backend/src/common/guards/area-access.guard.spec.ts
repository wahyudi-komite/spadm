import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AreaAccessGuard } from './area-access.guard';

describe('AreaAccessGuard', () => {
  const getMany = jest.fn();
  const queryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany,
  };
  const repository = {
    createQueryBuilder: jest.fn(() => queryBuilder),
  };
  const guard = new AreaAccessGuard(repository as any);

  function context(request: Record<string, any>): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows an active PIC to access the assigned area', async () => {
    getMany.mockResolvedValue([
      { areaId: 2, role: { name: 'AREA_PIC' } },
    ]);
    const request = { user: { sub: 10 }, query: { areaId: '2' } };

    await expect(guard.canActivate(context(request))).resolves.toBe(true);
    expect(request).toHaveProperty('areaAccess', {
      unrestricted: false,
      areaIds: [2],
    });
  });

  it('rejects a PIC accessing a different area', async () => {
    getMany.mockResolvedValue([
      { areaId: 2, role: { name: 'AREA_PIC' } },
    ]);

    await expect(
      guard.canActivate(
        context({ user: { sub: 10 }, query: { areaId: '3' } }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows bazaar administrators to access every area', async () => {
    getMany.mockResolvedValue([
      { areaId: null, role: { name: 'BAZAAR_ADMIN' } },
    ]);

    await expect(
      guard.canActivate(
        context({ user: { sub: 1 }, query: { areaId: '99' } }),
      ),
    ).resolves.toBe(true);
  });
});

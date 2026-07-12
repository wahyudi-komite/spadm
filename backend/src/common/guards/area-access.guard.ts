import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AreaAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Placeholder — will be implemented in Phase 8 (Distribusi)
    return true;
  }
}

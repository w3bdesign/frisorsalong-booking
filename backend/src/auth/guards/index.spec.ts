import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import * as guards from './index';

describe('Guards barrel exports', () => {
  it('should export JwtAuthGuard', () => {
    expect(guards.JwtAuthGuard).toBeDefined();
    expect(guards.JwtAuthGuard).toBe(JwtAuthGuard);
  });

  it('should export RolesGuard', () => {
    expect(guards.RolesGuard).toBeDefined();
    expect(guards.RolesGuard).toBe(RolesGuard);
  });
});

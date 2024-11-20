import { Role } from './role.enum';

describe('Role Enum', () => {
  it('should define USER role', () => {
    expect(Role.USER).toBeDefined();
    expect(Role.USER).toBe('user');
  });

  it('should define ADMIN role', () => {
    expect(Role.ADMIN).toBeDefined();
    expect(Role.ADMIN).toBe('admin');
  });

  it('should define EMPLOYEE role', () => {
    expect(Role.EMPLOYEE).toBeDefined();
    expect(Role.EMPLOYEE).toBe('employee');
  });

  it('should have exactly three roles', () => {
    const roleValues = Object.values(Role);
    expect(roleValues).toHaveLength(3);
    expect(roleValues).toEqual(['user', 'admin', 'employee']);
  });

  it('should be usable in type checks', () => {
    const checkRole = (role: Role): boolean => {
      return Object.values(Role).includes(role);
    };

    expect(checkRole(Role.USER)).toBe(true);
    expect(checkRole(Role.ADMIN)).toBe(true);
    expect(checkRole(Role.EMPLOYEE)).toBe(true);
    expect(checkRole('invalid' as Role)).toBe(false);
  });

  it('should be usable in switch statements', () => {
    const getRoleLevel = (role: Role): number => {
      switch (role) {
        case Role.ADMIN:
          return 3;
        case Role.EMPLOYEE:
          return 2;
        case Role.USER:
          return 1;
        default:
          return 0;
      }
    };

    expect(getRoleLevel(Role.ADMIN)).toBe(3);
    expect(getRoleLevel(Role.EMPLOYEE)).toBe(2);
    expect(getRoleLevel(Role.USER)).toBe(1);
  });
});

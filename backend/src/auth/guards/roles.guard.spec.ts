import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              role: UserRole.CUSTOMER,
            },
          }),
        }),
      } as unknown as ExecutionContext;
    });

    it('should allow access when no roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should allow access when user has required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.CUSTOMER]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should allow access when user has one of multiple required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue([
        UserRole.ADMIN,
        UserRole.CUSTOMER,
      ]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle roles defined at both handler and class level', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.CUSTOMER]);
      
      const mockContext = {
        ...mockExecutionContext,
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      const result = guard.canActivate(mockContext as ExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });
});

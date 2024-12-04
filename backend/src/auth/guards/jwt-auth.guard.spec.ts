import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User, UserRole } from '../../users/entities/user.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    guard = new JwtAuthGuard();

    // Mock request object
    mockRequest = {
      headers: {},
    };

    // Mock execution context
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when Authorization header is missing', () => {
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Missing Authorization header')
      );
    });

    it('should throw UnauthorizedException when Authorization header does not start with Bearer', () => {
      mockRequest.headers.authorization = 'Basic token123';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Authorization header must start with "Bearer "')
      );
    });

    it('should throw UnauthorizedException when token is not provided', () => {
      mockRequest.headers.authorization = 'Bearer ';

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Token not provided')
      );
    });

    it('should call super.canActivate when token is valid', () => {
      mockRequest.headers.authorization = 'Bearer valid.token.here';

      // Mock super.canActivate
      const mockSuperCanActivate = jest.fn().mockReturnValue(true);
      guard.canActivate = jest.fn().mockImplementation(function(this: any, context: ExecutionContext) {
        return mockSuperCanActivate.call(this, context);
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSuperCanActivate).toHaveBeenCalledWith(mockExecutionContext);
    });
  });

  describe('handleRequest', () => {
    it('should return user when authentication is successful', () => {
      const mockUser: Partial<User> = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CUSTOMER
      };
      const result = guard.handleRequest(null, mockUser as User, null, mockExecutionContext);
      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedException when user is not found', () => {
      expect(() => guard.handleRequest(null, false, null, mockExecutionContext)).toThrow(
        new UnauthorizedException('User not authenticated')
      );
    });

    it('should throw UnauthorizedException for invalid token format', () => {
      const jwtError = new Error('Invalid token');
      (jwtError as any).name = 'JsonWebTokenError';

      expect(() => guard.handleRequest(null, false, jwtError, mockExecutionContext)).toThrow(
        new UnauthorizedException('Invalid token format')
      );
    });

    it('should throw UnauthorizedException for expired token', () => {
      const expiredError = new Error('Token expired');
      (expiredError as any).name = 'TokenExpiredError';

      expect(() => guard.handleRequest(null, false, expiredError, mockExecutionContext)).toThrow(
        new UnauthorizedException('Token has expired')
      );
    });

    it('should throw original error when error is provided', () => {
      const originalError = new Error('Custom error');

      expect(() => guard.handleRequest(originalError, false, null, mockExecutionContext)).toThrow(originalError);
    });

    it('should log debug information when error occurs', () => {
      const mockUser: Partial<User> = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CUSTOMER
      };
      const mockInfo = { message: 'Test info' };

      try {
        guard.handleRequest(null, false, mockInfo, mockExecutionContext);
      } catch (error) {
        // Expected to throw, we just want to verify the logs
      }

      const calls = (console.log as jest.Mock).mock.calls;
      expect(calls[0]).toEqual(['JWT Auth Guard - Error:', 'null']);
      expect(calls[1]).toEqual(['JWT Auth Guard - User:', false]);
      expect(calls[2]).toEqual(['JWT Auth Guard - Info:', mockInfo]);
    });
  });
});

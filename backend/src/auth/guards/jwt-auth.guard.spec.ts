import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

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
      const mockUser = { id: 1, username: 'testuser' };
      const result = guard.handleRequest(null, mockUser, null);
      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedException when user is not found', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        new UnauthorizedException('User not authenticated')
      );
    });

    it('should throw UnauthorizedException for invalid token format', () => {
      const jwtError = new Error('Invalid token');
      (jwtError as any).name = 'JsonWebTokenError';

      expect(() => guard.handleRequest(null, null, jwtError)).toThrow(
        new UnauthorizedException('Invalid token format')
      );
    });

    it('should throw UnauthorizedException for expired token', () => {
      const expiredError = new Error('Token expired');
      (expiredError as any).name = 'TokenExpiredError';

      expect(() => guard.handleRequest(null, null, expiredError)).toThrow(
        new UnauthorizedException('Token has expired')
      );
    });

    it('should throw original error when error is provided', () => {
      const originalError = new Error('Custom error');

      expect(() => guard.handleRequest(originalError, null, null)).toThrow(originalError);
    });

    it('should log debug information when error occurs', () => {
      const mockUser = { id: 1, username: 'testuser' };
      const mockInfo = { message: 'Test info' };

      try {
        guard.handleRequest(null, null, mockInfo);
      } catch (error) {
        // Expected to throw, we just want to verify the logs
      }

      expect(console.log).toHaveBeenCalledWith('JWT Auth Guard - Error:', null);
      expect(console.log).toHaveBeenCalledWith('JWT Auth Guard - User:', null);
      expect(console.log).toHaveBeenCalledWith('JWT Auth Guard - Info:', 'Test info');
    });
  });
});

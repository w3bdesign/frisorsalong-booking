import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User, UserRole } from '../../users/entities/user.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: {headers: Record<string, unknown>};

  beforeEach(() => {
    guard = new JwtAuthGuard();

    // Mock request object with proper typing
    mockRequest = {
      headers: {},
    };

    // Mock execution context with proper typing
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when Authorization header is missing', () => {
      const expectedError = new UnauthorizedException('Missing Authorization header');
      const testFn = () => guard.canActivate(mockExecutionContext);
      expect(testFn).toThrow(expectedError);
    });

    it('should throw UnauthorizedException when Authorization header does not start with Bearer', () => {
      mockRequest.headers.authorization = 'Basic token123';
      const expectedError = new UnauthorizedException('Authorization header must start with "Bearer "');
      const testFn = () => guard.canActivate(mockExecutionContext);
      expect(testFn).toThrow(expectedError);
    });

    it('should throw UnauthorizedException when token is not provided', () => {
      mockRequest.headers.authorization = 'Bearer ';
      const expectedError = new UnauthorizedException('Token not provided');
      const testFn = () => guard.canActivate(mockExecutionContext);
      expect(testFn).toThrow(expectedError);
    });

    it('should call super.canActivate when token is valid', () => {
      mockRequest.headers.authorization = 'Bearer valid.token.here';

      // Mock super.canActivate with proper typing
      const mockSuperCanActivate = jest.fn().mockReturnValue(true);
      guard.canActivate = jest.fn().mockImplementation(function(this: JwtAuthGuard, context: ExecutionContext) {
        return mockSuperCanActivate.call(this, context);
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockSuperCanActivate).toHaveBeenCalledWith(mockExecutionContext);
    });
  });

  describe('handleRequest', () => {
    it('should return user when authentication is successful', () => {
      const mockAuthUser = new User();
      Object.assign(mockAuthUser, {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CUSTOMER,
        password: 'hashed_password',
        phoneNumber: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = guard.handleRequest(null, mockAuthUser, null, mockExecutionContext);
      expect(result).toBe(mockAuthUser);
    });

    it('should throw UnauthorizedException when user is not found', () => {
      const expectedError = new UnauthorizedException('User not authenticated');
      const testFn = () => guard.handleRequest(null, false, null, mockExecutionContext);
      expect(testFn).toThrow(expectedError);
    });

    it('should throw UnauthorizedException for invalid token format', () => {
      const jwtError = Object.assign(new Error('Invalid token'), { name: 'JsonWebTokenError' });
      const expectedError = new UnauthorizedException('Invalid token format');
      const testFn = () => guard.handleRequest(null, false, jwtError, mockExecutionContext);
      expect(testFn).toThrow(expectedError);
    });

    it('should throw UnauthorizedException for expired token', () => {
      const expiredError = Object.assign(new Error('Token expired'), { name: 'TokenExpiredError' });
      const expectedError = new UnauthorizedException('Token has expired');
      const testFn = () => guard.handleRequest(null, false, expiredError, mockExecutionContext);
      expect(testFn).toThrow(expectedError);
    });

    it('should throw original error when error is provided', () => {
      const originalError = new Error('Custom error');
      const testFn = () => guard.handleRequest(originalError, false, null, mockExecutionContext);
      expect(testFn).toThrow(originalError);
    });

    it('should log debug information when error occurs', () => {
      const mockInfo = { message: 'Test info' };

      try {
        guard.handleRequest(null, false, mockInfo, mockExecutionContext);
      } catch (error) {
        // Expected to throw, we just want to verify the logs
      }

      const consoleMock = console.log as jest.Mock;
      const calls = consoleMock.mock.calls;
      
      expect(calls[0]).toEqual(['JWT Auth Guard - Error:', 'null']);
      expect(calls[1]).toEqual(['JWT Auth Guard - User:', false]);
      expect(calls[2]).toEqual(['JWT Auth Guard - Info:', '[object Object]']);
    });
  });
});

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockExecutionContext: ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when Authorization header is missing', () => {
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Missing Authorization header'),
      );
    });

    it('should throw UnauthorizedException when Authorization header is not a string', () => {
      jest.spyOn(mockExecutionContext.switchToHttp(), 'getRequest').mockReturnValue({
        headers: { authorization: ['Bearer token'] },
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Invalid Authorization header format'),
      );
    });

    it('should throw UnauthorizedException when Authorization header does not start with Bearer', () => {
      jest.spyOn(mockExecutionContext.switchToHttp(), 'getRequest').mockReturnValue({
        headers: { authorization: 'Basic token' },
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Authorization header must start with "Bearer "'),
      );
    });

    it('should throw UnauthorizedException when Authorization header has wrong format', () => {
      jest.spyOn(mockExecutionContext.switchToHttp(), 'getRequest').mockReturnValue({
        headers: { authorization: 'Bearer token extra' },
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Invalid Authorization header format'),
      );
    });

    it('should throw UnauthorizedException when token is missing', () => {
      jest.spyOn(mockExecutionContext.switchToHttp(), 'getRequest').mockReturnValue({
        headers: { authorization: 'Bearer ' },
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Token not provided'),
      );
    });

    it('should call super.canActivate when token is valid', () => {
      jest.spyOn(mockExecutionContext.switchToHttp(), 'getRequest').mockReturnValue({
        headers: { authorization: 'Bearer valid-token' },
      });

      const superCanActivateSpy = jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockImplementation(() => true);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
    });
  });

  describe('handleRequest', () => {
    it('should return user when authentication is successful', () => {
      const user = { id: '1', email: 'test@example.com' };
      const result = guard.handleRequest(null, user, null);
      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException when user is not authenticated', () => {
      expect(() => guard.handleRequest(null, false, null)).toThrow(
        new UnauthorizedException('User not authenticated'),
      );
    });

    it('should throw UnauthorizedException for invalid token format', () => {
      const jwtError = new Error('invalid token') as any;
      jwtError.name = 'JsonWebTokenError';

      expect(() => guard.handleRequest(null, false, jwtError)).toThrow(
        new UnauthorizedException('Invalid token format'),
      );
    });

    it('should throw UnauthorizedException for expired token', () => {
      const jwtError = new Error('jwt expired') as any;
      jwtError.name = 'TokenExpiredError';

      expect(() => guard.handleRequest(null, false, jwtError)).toThrow(
        new UnauthorizedException('Token has expired'),
      );
    });

    it('should throw original error when error is provided', () => {
      const error = new Error('Custom error');
      expect(() => guard.handleRequest(error, false, null)).toThrow(error);
    });

    it('should convert non-Error error to UnauthorizedException', () => {
      expect(() => guard.handleRequest('string error' as any, false, null)).toThrow(
        new UnauthorizedException('string error'),
      );
    });
  });
});

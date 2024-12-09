import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  const mockExecutionContext = (headers: Record<string, any>): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
      } as Request),
    }),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when Authorization header is missing', () => {
      const context = mockExecutionContext({});

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Missing Authorization header'),
      );
    });

    it('should throw UnauthorizedException when Authorization header is not a string', () => {
      const context = mockExecutionContext({
        authorization: ['Bearer token'],
      });

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Invalid Authorization header format'),
      );
    });

    it('should throw UnauthorizedException when Authorization header does not start with Bearer', () => {
      const context = mockExecutionContext({
        authorization: 'Basic token',
      });

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Authorization header must start with "Bearer "'),
      );
    });

    it('should throw UnauthorizedException when Authorization header has wrong format', () => {
      const context = mockExecutionContext({
        authorization: 'Bearer token extra',
      });

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Invalid Authorization header format'),
      );
    });

    it('should throw UnauthorizedException when token is missing', () => {
      const context = mockExecutionContext({
        authorization: 'Bearer ',
      });

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Token not provided'),
      );
    });

    it('should call super.canActivate when token is valid', () => {
      const context = mockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      const superCanActivateSpy = jest
        .spyOn(JwtAuthGuard.prototype, 'canActivate')
        .mockImplementation(() => true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
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

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  interface RequestMock {
    headers: {
      authorization?: string | string[];
    };
  }

  const createMockContext = (request: RequestMock): ExecutionContext => ({
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  } as unknown as ExecutionContext);

  const testUnauthorizedScenario = (
    scenario: {
      headers: { authorization?: string | string[] },
      expectedError: string
    }
  ) => {
    const context = createMockContext({ headers: scenario.headers });
    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException(scenario.expectedError)
    );
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('canActivate', () => {
    const authorizationScenarios = [
      {
        description: 'missing Authorization header',
        headers: {},
        expectedError: 'Missing Authorization header'
      },
      {
        description: 'non-string Authorization header',
        headers: { authorization: ['Bearer token'] },
        expectedError: 'Invalid Authorization header format'
      },
      {
        description: 'wrong auth type',
        headers: { authorization: 'Basic token' },
        expectedError: 'Authorization header must start with "Bearer "'
      },
      {
        description: 'wrong format',
        headers: { authorization: 'Bearer token extra' },
        expectedError: 'Invalid Authorization header format'
      },
      {
        description: 'missing token',
        headers: { authorization: 'Bearer ' },
        expectedError: 'Token not provided'
      }
    ];

    authorizationScenarios.forEach(scenario => {
      it(`should throw UnauthorizedException when ${scenario.description}`, () => {
        testUnauthorizedScenario(scenario);
      });
    });

    it('should call super.canActivate when token is valid', () => {
      const context = createMockContext({
        headers: { authorization: 'Bearer valid-token' }
      });

      const superCanActivateSpy = jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockImplementation(() => true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });
  });

  describe('handleRequest', () => {
    type JwtErrorName = 'JsonWebTokenError' | 'TokenExpiredError';
    
    interface JwtError extends Error {
      name: JwtErrorName;
    }

    function createJwtError(message: string, name: JwtErrorName): JwtError {
      const error = new Error(message) as JwtError;
      error.name = name;
      return error;
    }

    const expectHandleRequestToThrow = (
      error: Error | null,
      info: JwtError | null,
      expectedMessage: string
    ): void => {
      let thrownError: Error | undefined;
      try {
        guard.handleRequest(error, false, info);
      } catch (e: unknown) {
        thrownError = e as Error;
      }
      expect(thrownError).toBeDefined();
      expect(thrownError).toBeInstanceOf(Error);
      expect((thrownError as Error).message).toContain(expectedMessage);
    };

    it('should return user when authentication is successful', () => {
      const user = { id: '1', email: 'test@example.com' };
      const result = guard.handleRequest(null, user, null);
      expect(result).toBe(user);
    });

    const errorScenarios: Array<{
      description: string;
      error: Error | null;
      info: JwtError | null;
      expectedMessage: string;
      expectedType: typeof UnauthorizedException | typeof Error;
    }> = [
      {
        description: 'user not authenticated',
        error: null,
        info: null,
        expectedMessage: 'User not authenticated',
        expectedType: UnauthorizedException
      },
      {
        description: 'invalid token format',
        error: null,
        info: createJwtError('invalid token', 'JsonWebTokenError'),
        expectedMessage: 'Invalid token format',
        expectedType: UnauthorizedException
      },
      {
        description: 'expired token',
        error: null,
        info: createJwtError('jwt expired', 'TokenExpiredError'),
        expectedMessage: 'Token has expired',
        expectedType: UnauthorizedException
      }
    ];

    errorScenarios.forEach(scenario => {
      it(`should throw UnauthorizedException for ${scenario.description}`, () => {
        expectHandleRequestToThrow(scenario.error, scenario.info, scenario.expectedMessage);
      });
    });

    it('should throw original error when error is provided', () => {
      const error = new Error('Custom error');
      let thrownError: Error | undefined;
      try {
        guard.handleRequest(error, false, null);
      } catch (e: unknown) {
        thrownError = e as Error;
      }
      expect(thrownError).toBe(error);
    });

    it('should convert non-Error error to UnauthorizedException', () => {
      const errorMessage = 'string error';
      // Pass a non-Error value to exercise the guard's String(err) branch
      let thrownError: Error | undefined;
      try {
        guard.handleRequest(errorMessage as unknown as Error, false, null);
      } catch (e: unknown) {
        thrownError = e as Error;
      }
      expect(thrownError).toBeDefined();
      expect(thrownError).toBeInstanceOf(UnauthorizedException);
      expect((thrownError as Error).message).toContain(errorMessage);
    });
  });
});

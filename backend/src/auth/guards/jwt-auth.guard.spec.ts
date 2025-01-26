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

    const testErrorScenario = (
      error: Error | null,
      info: JwtError | null,
      expectedError: UnauthorizedException | Error
    ) => {
      expect(() => guard.handleRequest(error, false, info)).toThrow(expectedError);
    };

    const testStringErrorScenario = (
      errorMessage: string,
      info: JwtError | null,
      expectedError: UnauthorizedException | Error
    ) => {
      const error = new Error(errorMessage);
      expect(() => guard.handleRequest(error, false, info)).toThrow(expectedError);
    };

    it('should return user when authentication is successful', () => {
      const user = { id: '1', email: 'test@example.com' };
      const result = guard.handleRequest(null, user, null);
      expect(result).toBe(user);
    });

    const errorScenarios = [
      {
        description: 'user not authenticated',
        error: null,
        info: null,
        expectedError: new UnauthorizedException('User not authenticated')
      },
      {
        description: 'invalid token format',
        error: null,
        info: createJwtError('invalid token', 'JsonWebTokenError'),
        expectedError: new UnauthorizedException('Invalid token format')
      },
      {
        description: 'expired token',
        error: null,
        info: createJwtError('jwt expired', 'TokenExpiredError'),
        expectedError: new UnauthorizedException('Token has expired')
      }
    ];

    errorScenarios.forEach(scenario => {
      it(`should throw UnauthorizedException for ${scenario.description}`, () => {
        testErrorScenario(scenario.error, scenario.info, scenario.expectedError);
      });
    });

    it('should throw original error when error is provided', () => {
      const error = new Error('Custom error');
      testErrorScenario(error, null, error);
    });

    it('should convert non-Error error to UnauthorizedException', () => {
      const errorMessage = 'string error';
      testStringErrorScenario(
        errorMessage,
        null,
        new UnauthorizedException(errorMessage)
      );
    });
  });
});

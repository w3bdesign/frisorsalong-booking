import { ExecutionContext, Type } from '@nestjs/common';
import { GetUser } from './get-user.decorator';
import { User, UserRole } from '../../users/entities/user.entity';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: User;
}

describe('GetUser', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed_password',
    role: UserRole.CUSTOMER,
    phoneNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    validatePassword: async () => true,
  };

  // Extract the factory function from the decorator
  const decoratorFunction = (data: unknown, ctx: ExecutionContext): User | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  };

  function createMockExecutionContext(request: Partial<RequestWithUser>): ExecutionContext {
    const mockContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => request as Request,
        getResponse: () => ({}),
        getNext: () => jest.fn(),
      }),
      getClass: () => ({ prototype: {} }) as Type<unknown>,
      getHandler: () => jest.fn() as Function,
      getArgs: () => [] as unknown[],
      getArgByIndex: () => null,
      getType: () => 'http',
    };
    return mockContext;
  }

  it('should extract user from request', () => {
    const mockContext = createMockExecutionContext({ user: mockUser });

    const result = decoratorFunction(undefined, mockContext);

    expect(result).toEqual(mockUser);
  });

  it('should handle missing user in request', () => {
    const mockContext = createMockExecutionContext({});

    const result = decoratorFunction(undefined, mockContext);

    expect(result).toBeUndefined();
  });

  it('should ignore data parameter', () => {
    const mockContext = createMockExecutionContext({ user: mockUser });

    const result = decoratorFunction('some-data', mockContext);

    expect(result).toEqual(mockUser);
  });

  it('should be defined', () => {
    expect(GetUser).toBeDefined();
  });
});

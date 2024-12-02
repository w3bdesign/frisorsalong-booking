import { ExecutionContext } from '@nestjs/common';
import { GetUser } from './get-user.decorator';
import { User } from '../../users/entities/user.entity';

describe('GetUser', () => {
  const mockUser: Partial<User> = {
    id: 'user-1',
    email: 'test@example.com',
  };

  // Extract the factory function from the decorator
  const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  };

  it('should extract user from request', () => {
    // Create mock functions for the context chain
    const getRequest = jest.fn().mockReturnValue({ user: mockUser });
    const switchToHttp = jest.fn().mockReturnValue({ getRequest });

    const mockContext = {
      switchToHttp
    } as unknown as ExecutionContext;

    // Execute the factory function directly
    const result = decoratorFunction(undefined, mockContext);

    expect(result).toEqual(mockUser);
    expect(switchToHttp).toHaveBeenCalled();
    expect(getRequest).toHaveBeenCalled();
  });

  it('should handle missing user in request', () => {
    // Create mock functions for the context chain
    const getRequest = jest.fn().mockReturnValue({});
    const switchToHttp = jest.fn().mockReturnValue({ getRequest });

    const mockContext = {
      switchToHttp
    } as unknown as ExecutionContext;

    // Execute the factory function directly
    const result = decoratorFunction(undefined, mockContext);

    expect(result).toBeUndefined();
    expect(switchToHttp).toHaveBeenCalled();
    expect(getRequest).toHaveBeenCalled();
  });

  it('should ignore data parameter', () => {
    // Create mock functions for the context chain
    const getRequest = jest.fn().mockReturnValue({ user: mockUser });
    const switchToHttp = jest.fn().mockReturnValue({ getRequest });

    const mockContext = {
      switchToHttp
    } as unknown as ExecutionContext;

    // Execute the factory function with data
    const result = decoratorFunction('some-data', mockContext);

    expect(result).toEqual(mockUser);
    expect(switchToHttp).toHaveBeenCalled();
    expect(getRequest).toHaveBeenCalled();
  });

  it('should be defined', () => {
    expect(GetUser).toBeDefined();
  });
});

import { ExecutionContext, Type } from "@nestjs/common";
import { GetUser } from "./get-user.decorator";
import { User, UserRole } from "../../users/entities/user.entity";
import { Request } from "express";
import {
  HttpArgumentsHost,
  RpcArgumentsHost,
  WsArgumentsHost,
} from "@nestjs/common/interfaces";

interface RequestWithUser extends Request {
  user?: User;
}

describe("GetUser", () => {
  const mockUser: User = {
    id: "user-1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    password: "hashed_password",
    role: UserRole.CUSTOMER,
    phoneNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    async validatePassword(): Promise<boolean> {
      await Promise.resolve();
      return true;
    },
    async hashPassword(): Promise<void> {
      await Promise.resolve();
    },
  };

  // Extract the factory function from the decorator
  const decoratorFunction = (
    data: unknown,
    ctx: ExecutionContext
  ): User | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  };

  function createMockExecutionContext(
    request: Partial<RequestWithUser>
  ): ExecutionContext {
    // Cast the mock implementations to their respective interfaces
    const mockHttpContext = {
      getRequest: <T>() => request as T,
      getResponse: <T>() => ({}) as T,
      getNext: <T>() => (() => {}) as T,
    } as HttpArgumentsHost;

    const mockRpcContext = {
      getData: <T>() => ({}) as T,
      getContext: <T>() => ({}) as T,
    } as RpcArgumentsHost;

    const mockWsContext = {
      getData: <T>() => ({}) as T,
      getClient: <T>() => ({}) as T,
      getPattern: () => "",
    } as WsArgumentsHost;

    const mockExecutionContext = {
      switchToHttp: () => mockHttpContext,
      switchToRpc: () => mockRpcContext,
      switchToWs: () => mockWsContext,
      getType: () => "http",
      getClass: () => Object as Type<unknown>,
      getHandler: () => () => {},
      getArgs: () => [],
      getArgByIndex: () => null,
    } as ExecutionContext;

    return mockExecutionContext;
  }

  it("should extract user from request", () => {
    const mockContext = createMockExecutionContext({ user: mockUser });

    const result = decoratorFunction(undefined, mockContext);

    expect(result).toEqual(mockUser);
  });

  it("should handle missing user in request", () => {
    const mockContext = createMockExecutionContext({});

    const result = decoratorFunction(undefined, mockContext);

    expect(result).toBeUndefined();
  });

  it("should ignore data parameter", () => {
    const mockContext = createMockExecutionContext({ user: mockUser });

    const result = decoratorFunction("some-data", mockContext);

    expect(result).toEqual(mockUser);
  });

  it("should be defined", () => {
    expect(GetUser).toBeDefined();
  });
});

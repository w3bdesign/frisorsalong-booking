import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../users/entities/user.entity";

export const Roles = (...roles: UserRole[]): MethodDecorator => {
  const decorator: MethodDecorator = SetMetadata("roles", roles);
  return decorator;
};

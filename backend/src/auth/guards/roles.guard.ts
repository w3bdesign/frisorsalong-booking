import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../users/entities/user.entity";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      "roles",
      [context.getHandler(), context.getClass()],
    );

    // Add debug logging
    console.log('Roles Guard - Required Roles:', requiredRoles);

    if (!requiredRoles) {
      console.log('Roles Guard - No roles required');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('Roles Guard - User:', user);
    console.log('Roles Guard - User Role:', user?.role);

    if (!user) {
      console.log('Roles Guard - No user found in request');
      return false;
    }

    const hasRole = requiredRoles.includes(user.role);
    console.log('Roles Guard - Has Required Role:', hasRole);

    return hasRole;
  }
}

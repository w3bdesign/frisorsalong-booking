import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User, UserRole } from "../../users/entities/user.entity";
import { Request } from "express";

interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

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

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    
    console.log('Roles Guard - User:', user);
    console.log('Roles Guard - User Role:', user?.role);

    if (!user || !user.role) {
      console.log('Roles Guard - No user or role found in request');
      return false;
    }

    // Ensure user.role is a valid UserRole
    if (!Object.values(UserRole).includes(user.role)) {
      console.log('Roles Guard - Invalid user role');
      return false;
    }

    const hasRole: boolean = requiredRoles.includes(user.role);
    console.log('Roles Guard - Has Required Role:', hasRole);

    const canActivate: boolean = hasRole;
    return canActivate;
  }
}

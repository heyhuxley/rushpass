import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Roles } from '../common/decorators/roles.decorator.js';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get(Roles, context.getHandler());
    console.log('roles', roles);
    
    if (roles.length === 0) return true;
    
    const { user } = context.switchToHttp().getRequest();
    
    return !!user && roles.includes(user.role);
  }
}

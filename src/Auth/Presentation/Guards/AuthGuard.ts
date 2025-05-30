import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Logger } from '../../../Shared/Presentation/Utils/Logger';
import { JwtPayload } from '../../Domain/Payloads/JwtPayload';
import { UserPermissionRepository } from '../../Infrastructure/Repositories/UserPermissionRepository';
import { UserRoleRepository } from '../../Infrastructure/Repositories/UserRoleRepository';
import { PERMISSIONS_KEY } from '../Decorators/RequirePermissions';

@Injectable()
export class AuthGuard implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly userPermissionRepository: UserPermissionRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean>
  {
    const request = context.switchToHttp().getRequest();

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0)
    {
      const token = this.extractTokenFromRequest(request);

      if (!token)
      {
        throw new UnauthorizedException('No authentication token provided');
      }

      try
      {
        request.user = this.jwtService.verify<JwtPayload>(token);
        return true;
      }
      catch
      {
        throw new UnauthorizedException('Invalid authentication token');
      }
    }

    const token = this.extractTokenFromRequest(request);
    if (!token)
    {
      throw new UnauthorizedException('No authentication token provided');
    }

    try
    {
      const decodedToken = this.jwtService.verify<JwtPayload>(token);

      request.user = decodedToken;

      const userPermissions = await this.getUserPermissions(decodedToken.userId);

      const hasPermission = this.checkPermissions(userPermissions, requiredPermissions);

      if (!hasPermission)
      {
        throw new ForbiddenException('Insufficient permissions to access this resource');
      }

      return true;
    }
    catch (error)
    {
      if (error instanceof ForbiddenException)
      {
        throw error;
      }

      throw new UnauthorizedException(error.message);
    }
  }

  private extractTokenFromRequest(request: any): string | null
  {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer '))
    {
      return authHeader.substring(7);
    }

    if (request.cookies && request.cookies.user_token)
    {
      return request.cookies.user_token;
    }

    return null;
  }

  private async getUserPermissions(userId: number): Promise<string[]>
  {
    const userRoles = await this.userRoleRepository.getUserRoles(userId);

    const permissionsSet = new Set<string>();

    userRoles.forEach((userRole) =>
    {
      userRole.role.permissions.forEach((permission) =>
      {
        permissionsSet.add(permission.name);
      });
    });

    const directPermissions = await this.userPermissionRepository.getUserPermissions(userId);
    directPermissions.forEach((up) =>
    {
      permissionsSet.add(up.permission.name);
    });

    return Array.from(permissionsSet);
  }

  private checkPermissions(userPermissions: string[], requiredPermissions: string[]): boolean
  {
    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  }
}

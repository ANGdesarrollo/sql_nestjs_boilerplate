import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { PERMISSIONS_KEY } from '../Decorators/RequirePermissions';

interface JwtPayload {
  userId: string;
  username: string;
  tenantId: string;
  permissions: string[];
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean>
  {
    const request = context.switchToHttp().getRequest();

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0)
    {
      return true;
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

      if (!decodedToken.permissions || !Array.isArray(decodedToken.permissions))
      {
        throw new UnauthorizedException('Invalid token format: missing permissions');
      }

      const hasPermission = this.checkPermissions(
        decodedToken.permissions,
        requiredPermissions
      );

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

      throw new UnauthorizedException('Invalid authentication token');
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

  private checkPermissions(
    userPermissions: string[],
    requiredPermissions: string[]
  ): boolean
  {
    return requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

// Clave para los metadatos de permiso
export const PERMISSIONS_KEY = 'permissions';

// Decorador para asignar permisos a un controlador o método
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

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
      const decodedToken = this.jwtService.verify(token);

      request.user = decodedToken;

      const hasPermissions = this.hasRequiredPermissions(
        decodedToken.permissions,
        requiredPermissions
      );

      if (!hasPermissions)
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

  private hasRequiredPermissions(
    userPermissions: string[],
    requiredPermissions: string[]
  ): boolean
  {
    return requiredPermissions.every(permission =>
      userPermissions && userPermissions.includes(permission)
    );
  }
}

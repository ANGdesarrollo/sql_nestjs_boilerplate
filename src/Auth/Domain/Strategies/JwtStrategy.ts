import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request as RequestType } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { EnvService } from '../../../Config/Env/EnvService';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{
  constructor(private readonly envService: EnvService)
  {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      ignoreExpiration: false,
      secretOrKey: envService.jwt.secret
    });
  }

  private static extractJWT(req: RequestType): string | null
  {
    if (
      req.cookies &&
      'user_token' in req.cookies &&
      req.cookies.user_token.length > 0
    )
    {
      return req.cookies.user_token;
    }
    return null;
  }

  async validate(payload: any)
  {
    return { userId: payload.id };
  }
}

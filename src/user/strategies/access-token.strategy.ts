import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from 'src/config/config.service';
import { TokenPayload } from '../types/jwt.types';

export const AccessTokenStrategyName = 'jwt-accesss-token';

/**
 * This passport strategy is used to validate the JWT access token provided in the Authorization header and attaches the `TokenPayload` to the `req.user` object.
 */
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  AccessTokenStrategyName,
) {
  constructor(appConfigService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.auth.ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    return payload;
  }
}

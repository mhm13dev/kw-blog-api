import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from 'src/config/config.service';
import { TokenPayload } from '../types/jwt.types';

export const RefreshTokenStrategyName = 'jwt-refresh-token';

/**
 * This passport strategy is used to validate the JWT refresh token provided in the Authorization header and attaches the `TokenPayload` to the `req.user` object.
 */
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  RefreshTokenStrategyName,
) {
  constructor(appConfigService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.auth.REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    return payload;
  }
}

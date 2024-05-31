import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from 'src/config/config.service';
import { TokenPayload } from '../types/jwt.types';

export const RefreshTokenStrategyName = 'jwt-refresh-token';

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
    // TODO: add refresh token in the payload
    return payload;
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from 'src/config/config.service';
import { TokenPayload } from '../types/jwt.types';

export const RefreshTokenStrategyName = 'jwt-refresh-token';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  RefreshTokenStrategyName,
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.auth.REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    // TODO: add refresh token in the payload
    return payload;
  }
}

import { Resolver, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/user/entities';
import { Input } from 'src/common/graphql/args';
import { TokenPayload } from './types/jwt.types';
import { GqlRefreshTokenGuard } from './guards';
import { CurrentUserPayload } from './decorators';
import {
  LoginUserInput,
  LoginUserResponse,
  RefreshTokensResponse,
  RegisterUserInput,
} from './dto';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  registerUser(@Input() input: RegisterUserInput): Promise<User> {
    return this.authService.registerUser(input);
  }

  @Mutation(() => LoginUserResponse)
  async loginUser(@Input() input: LoginUserInput): Promise<LoginUserResponse> {
    return this.authService.loginUser(input);
  }

  @Mutation(() => RefreshTokensResponse)
  @UseGuards(GqlRefreshTokenGuard)
  async refreshTokens(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
    @Context()
    context: {
      req: Request;
    },
  ): Promise<RefreshTokensResponse> {
    const refreshToken = context.req.headers.authorization.split(' ')[1];
    return this.authService.refreshTokens(currentUserPayload, refreshToken);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlRefreshTokenGuard)
  async logout(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
  ): Promise<boolean> {
    return this.authService.logout(currentUserPayload);
  }
}

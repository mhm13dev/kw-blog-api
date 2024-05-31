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

/**
 * Contains all the mutations related to `User` authentication
 */
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Mutation to register a new `User`.
   * @param input - Input data for registering a new `User`
   * @returns Created `User` object from the database
   */
  @Mutation(() => User)
  registerUser(@Input() input: RegisterUserInput): Promise<User> {
    return this.authService.registerUser(input);
  }

  /**
   * Mutation to login a `User`. It creates a new `UserSession` in the database.
   * @param input - Input data for logging in a `User`
   * @returns `access_token`, `refresh_token` and `User` object
   */
  @Mutation(() => LoginUserResponse)
  async loginUser(@Input() input: LoginUserInput): Promise<LoginUserResponse> {
    return this.authService.loginUser(input);
  }

  /**
   * Mutation to refresh the `access_token` and `refresh_token`.
   * @param currentUserPayload - Logged in `User` payload
   * @param context - Express context to access the request object
   * @returns `access_token` and `refresh_token`
   */
  @Mutation(() => RefreshTokensResponse)
  @UseGuards(GqlRefreshTokenGuard)
  async refreshTokens(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
    @Context()
    context: {
      req: Request;
    },
  ): Promise<RefreshTokensResponse> {
    const refreshToken = context.req.headers.authorization!.split(' ')[1];
    return this.authService.refreshTokens(currentUserPayload, refreshToken);
  }

  /**
   * Mutation to logout a `User`.
   * @param currentUserPayload - Logged in `User` payload
   * @returns `true` if the `UserSession` is deleted successfully
   */
  @Mutation(() => Boolean)
  @UseGuards(GqlRefreshTokenGuard)
  async logout(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
  ): Promise<boolean> {
    return this.authService.logout(currentUserPayload);
  }
}

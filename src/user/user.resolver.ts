import { NotFoundException, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Context } from '@nestjs/graphql';
import { Request } from 'express';
import { Input } from 'src/common/graphql/args';
import { TokenPayload } from './types/jwt.types';
import {
  LoginUserInput,
  LoginUserResponse,
  RefreshTokensResponse,
  RegisterUserInput,
} from './dto';
import { GqlAccessTokenGuard } from './guards';
import { CurrentUserPayload } from './decorators';
import { User } from './entities';
import { GqlRefreshTokenGuard } from './guards';
import { UserService } from './user.service';

/**
 * Resolver for `User` entity
 *
 * This resolver is responsible for handling all the queries and mutations related to the `User` and `UserSession` entities.
 */
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * Mutation to register a new `User`.
   * @param input - Input data for registering a new `User`
   * @returns Created `User` object from the database
   */
  @Mutation(() => User)
  registerUser(@Input() input: RegisterUserInput): Promise<User> {
    return this.userService.registerUser(input);
  }

  /**
   * Mutation to login a `User`. It creates a new `UserSession` in the database.
   * @param input - Input data for logging in a `User`
   * @returns `access_token`, `refresh_token` and `User` object
   */
  @Mutation(() => LoginUserResponse)
  async loginUser(@Input() input: LoginUserInput): Promise<LoginUserResponse> {
    return this.userService.loginUser(input);
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
    return this.userService.refreshTokens(currentUserPayload, refreshToken);
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
    return this.userService.logout(currentUserPayload);
  }

  /**
   * Query to get the currently logged in User.
   * @param userId - ID of the user
   * @returns `User` object of the currently logged in user
   * @throws `NotFoundException` If the user is not found
   */
  @Query(() => User)
  @UseGuards(GqlAccessTokenGuard)
  async me(@CurrentUserPayload('sub') userId: string): Promise<User> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

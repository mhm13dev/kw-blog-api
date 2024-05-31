import { NotFoundException, UseGuards } from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';
import { GqlAccessTokenGuard } from 'src/auth/guards';
import { CurrentUserPayload } from 'src/auth/decorators';
import { User } from './entities';
import { UserService } from './user.service';

/**
 * Resolver for `User` entity
 */
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * Query to get the currently logged in User
   * @param userId - ID of the user
   * @returns `User` object of the currently logged in user
   * @throws `NotFoundException` If the user is not found
   * @throws `UnauthorizedException` If the user is not authenticated
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

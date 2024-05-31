import { NotFoundException, UseGuards } from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';
import { GqlAccessTokenGuard } from 'src/auth/guards';
import { CurrentUser } from 'src/auth/decorators';
import { User } from './entities';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  @UseGuards(GqlAccessTokenGuard)
  async me(@CurrentUser('sub') userId: string): Promise<User> {
    const user = this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

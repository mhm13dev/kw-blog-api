import { Resolver, Args, Query } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, {
    name: 'user',
  })
  async getUserById(@Args('_id') _id: string): Promise<User> {
    return this.userService.getUserById(_id);
  }
}

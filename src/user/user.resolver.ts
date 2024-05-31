import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => User, {
    name: 'user',
  })
  async findOne(@Args('_id') _id: string): Promise<User> {
    return this.userService.findOne(_id);
  }
}

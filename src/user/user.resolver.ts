import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { User } from './models/user.model';
import { CreateUserInput } from './dto/create-user.input';
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
  async findOne(@Args('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }
}

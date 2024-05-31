import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';
import { RegisterUserInput } from './dto/register-user.input';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  registerUser(
    @Args('registerUserInput') registerUserInput: RegisterUserInput,
  ): Promise<User> {
    return this.authService.registerUser(registerUserInput);
  }
}
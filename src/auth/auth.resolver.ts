import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';
import { LoginUserInput, RegisterUserInput } from './dto';
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

  @Mutation(() => User)
  async loginUser(
    @Args('loginUserInput') loginUserInput: LoginUserInput,
  ): Promise<User> {
    return this.authService.loginUser(loginUserInput);
  }
}

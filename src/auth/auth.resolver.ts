import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { User } from 'src/user/entities';
import { LoginUserInput, LoginUserResponse, RegisterUserInput } from './dto';
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

  @Mutation(() => LoginUserResponse)
  async loginUser(
    @Args('loginUserInput') loginUserInput: LoginUserInput,
  ): Promise<LoginUserResponse> {
    return this.authService.loginUser(loginUserInput);
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { LoginUserInput, LoginUserResponse, RegisterUserInput } from './dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async registerUser(registerUserInput: RegisterUserInput): Promise<User> {
    // Check if passwords match
    if (registerUserInput.password !== registerUserInput.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exist
    if (!!(await this.userService.findOneByEmail(registerUserInput.email))) {
      throw new ForbiddenException('Email already exist');
    }

    // Create User
    return this.userService.create({
      email: registerUserInput.email,
      password: registerUserInput.password,
      name: registerUserInput.email.split('@')[0],
    });
  }

  async loginUser(loginUserInput: LoginUserInput): Promise<LoginUserResponse> {
    const user = await this.userService.findOneByEmail(loginUserInput.email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!(await user.comparePassword(loginUserInput.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    return new LoginUserResponse({
      user,
      token: 'jwt token',
    });
  }
}

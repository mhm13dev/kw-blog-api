import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { RegisterUserInput } from './dto/register-user.input';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async registerUser(registerUserInput: RegisterUserInput): Promise<User> {
    // check if password match
    if (registerUserInput.password !== registerUserInput.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    // check if user already exist
    if (!!(await this.userService.findOneByEmail(registerUserInput.email))) {
      throw new ForbiddenException('Email already exist');
    }

    // Create User
    return this.userService.create({
      email: registerUserInput.email,
      password: registerUserInput.password, // TODO: hash password
      name: registerUserInput.email.split('@')[0],
    });
  }
}

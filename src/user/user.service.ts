import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './models/user.model';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UserService {
  private users: User[] = [];

  create(createUserInput: CreateUserInput) {
    const user = new User();
    user.id = this.users.length.toString();
    user.name = createUserInput.name;
    this.users.push(user);
    return user;
  }

  findOne(id: string): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

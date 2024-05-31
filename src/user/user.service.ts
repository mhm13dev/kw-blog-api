import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    const user = this.userRepository.create({
      name: createUserInput.name,
    });
    return this.userRepository.save(user);
  }

  async findOne(_id: string) {
    const user = await this.userRepository.findOneBy({
      _id: new ObjectId(_id),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

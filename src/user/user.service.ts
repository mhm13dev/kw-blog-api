import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { User, UserRole } from './entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(user: Partial<User>): Promise<User> {
    const preparedUser = this.userRepository.create(user);
    return this.userRepository.save(preparedUser);
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({
      email: email.toLowerCase().trim(),
    });
  }

  findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({
      _id: new ObjectId(id),
    });
  }

  async doesAdminExist(): Promise<boolean> {
    const admin = await this.userRepository.findOneBy({
      role: UserRole.admin,
    });

    return !!admin;
  }
}

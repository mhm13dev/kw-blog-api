import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities';

/**
 * Service for operations on the `User` entity.
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new `User` in the database.
   * @param user - Input data for the `User`
   * @returns Created `User` object from the database
   */
  create(user: Partial<User>): Promise<User> {
    const preparedUser = this.userRepository.create(user);
    return this.userRepository.save(preparedUser);
  }

  /**
   * Finds a `User` by email.
   * @param email - Email of the `User`
   * @returns `User` if found, `null` otherwise
   */
  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({
      email: email.toLowerCase().trim(),
    });
  }

  /**
   * Finds a `User` by id.
   * @param id - ID of the `User`
   * @returns `User` if found, `null` otherwise
   */
  findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  /**
   * Checks if a `User` with role of `admin` exists.
   * @returns `true` if a `User` with role of `admin` exists, otherwise `false`
   */
  async doesAdminExist(): Promise<boolean> {
    const admin = await this.userRepository.findOneBy({
      role: UserRole.admin,
    });
    return !!admin;
  }
}

import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import * as argon2 from 'argon2';

export enum UserRole {
  admin = 'admin',
  user = 'user',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

/**
 * `User` entity for the Database and GraphQL Schema
 */
@ObjectType()
@Entity({
  name: 'users',
})
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({
    unique: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @Column()
  password: string;

  @Field()
  @Column()
  name: string;

  /**
   * The `User` can have 2 roles:
   * - `admin`
   * - `user`
   *
   * The `admin` will be created manually with a seed script.
   *
   * All other users who sign up will have the `user` role by default.
   */
  @Field(() => UserRole)
  @Column({
    default: UserRole.user,
    enum: UserRole,
  })
  role: UserRole;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  /**
   * Hashes the password before inserting or updating the `User`
   *
   * Uses the {@link https://www.npmjs.com/package/argon2 | argon2} library to hash the password
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await argon2.hash(this.password);
    }
  }

  comparePassword(attemptedPassword: string): Promise<boolean> {
    return argon2.verify(this.password, attemptedPassword);
  }
}

import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ObjectId,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
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
  @ObjectIdColumn()
  _id: ObjectId;

  @Field()
  @Column({
    unique: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @Column()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @Field()
  @Column()
  name: string;

  @Field(() => UserRole)
  @Column({
    default: UserRole.user,
    enum: UserRole,
  })
  role: UserRole;

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

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

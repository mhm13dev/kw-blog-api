import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ObjectId,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

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
}

import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../user.entity';

@InputType()
export class CreateUserInput extends PickType(
  User,
  ['email', 'password'],
  InputType,
) {
  @Field()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

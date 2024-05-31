import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../../user/entities';

@InputType()
export class RegisterUserInput extends PickType(User, ['email'], InputType) {
  @Field()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @Field()
  @MinLength(8)
  @IsNotEmpty()
  confirm_password: string;
}

import { Field, InputType, PickType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { User } from '../../user/user.entity';

@InputType()
export class LoginUserInput extends PickType(User, ['email'], InputType) {
  @Field()
  @IsNotEmpty()
  password: string;
}

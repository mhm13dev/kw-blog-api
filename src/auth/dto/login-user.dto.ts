import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { User } from '../../user/user.entity';
import { TokensPair } from '../types/jwt.types';

@InputType()
export class LoginUserInput extends PickType(User, ['email'], InputType) {
  @Field()
  @IsNotEmpty()
  password: string;
}

@ObjectType()
export class LoginUserResponse extends TokensPair {
  @Field(() => User)
  user: User;

  constructor(partial?: Partial<LoginUserResponse>) {
    super(partial);
    Object.assign(this, partial);
  }
}

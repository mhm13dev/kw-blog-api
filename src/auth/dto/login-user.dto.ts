import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { User } from '../../user/user.entity';

@InputType()
export class LoginUserInput extends PickType(User, ['email'], InputType) {
  @Field()
  @IsNotEmpty()
  password: string;
}

@ObjectType()
export class LoginUserResponse {
  @Field(() => User)
  user: User;

  @Field()
  token: string;

  constructor(partial?: Partial<LoginUserResponse>) {
    Object.assign(this, partial);
  }
}

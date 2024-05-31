import { Field, ObjectType } from '@nestjs/graphql';
import { UserRole } from 'src/user/entities';

@ObjectType()
export class TokensPair {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  constructor(partial?: Partial<TokensPair>) {
    Object.assign(this, partial);
  }
}

export class TokenPayload {
  sub: string;
  role: UserRole;
  session_id: string;

  constructor(partial: Partial<TokenPayload>) {
    Object.assign(this, partial);
  }
}

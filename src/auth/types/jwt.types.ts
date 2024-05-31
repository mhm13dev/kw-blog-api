import { Field, ObjectType } from '@nestjs/graphql';

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
  session_id: string;

  constructor(partial: Partial<TokenPayload>) {
    Object.assign(this, partial);
  }
}

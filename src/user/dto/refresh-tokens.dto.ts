import { ObjectType } from '@nestjs/graphql';
import { TokensPair } from '../types/jwt.types';

@ObjectType()
export class RefreshTokensResponse extends TokensPair {}

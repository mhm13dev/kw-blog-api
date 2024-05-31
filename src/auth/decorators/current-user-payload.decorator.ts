import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenPayload } from '../types/jwt.types';

export const CurrentUserPayload = createParamDecorator(
  (data: keyof TokenPayload | undefined, context: ExecutionContext) => {
    const request = GqlExecutionContext.create(context).getContext().req;
    if (!data) {
      return request.user;
    }
    return request.user[data];
  },
);

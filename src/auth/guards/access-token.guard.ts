import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { AccessTokenStrategyName } from '../strategies';

@Injectable()
export class GqlAccessTokenGuard extends AuthGuard(AccessTokenStrategyName) {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

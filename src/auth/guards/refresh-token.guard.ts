import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenStrategyName } from '../strategies';

@Injectable()
export class GqlRefreshTokenGuard extends AuthGuard(RefreshTokenStrategyName) {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

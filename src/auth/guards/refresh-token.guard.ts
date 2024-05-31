import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { RefreshTokenStrategyName } from '../strategies';

/**
 * Guard to protect GraphQL resolvers with `refresh_token` strategy
 *
 * This guard is responsible for checking the `refresh_token` from the request headers.
 * If the token is valid, it will allow the request to proceed.
 *
 * @throws `UnauthorizedException` If the `refresh_token` is invalid
 */
@Injectable()
export class GqlRefreshTokenGuard extends AuthGuard(RefreshTokenStrategyName) {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

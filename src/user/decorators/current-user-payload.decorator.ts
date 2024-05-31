import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenPayload } from '../types/jwt.types';

/**
 * Param decorator to get the currently logged in `User`'s payload object from the request.
 * @param data - The key of the `TokenPayload` to return
 * @returns Param decorator
 * @example
 * Use in a resolver where method is decorated with `@UseGuards(GqlAccessTokenGuard)` or `@UseGuards(GqlRefreshTokenGuard)`
 * ```ts
 * \@Mutation(() => Post)
 * \@UseGuards(GqlAccessTokenGuard)
 * createPost(@CurrentUserPayload() currentUserPayload: TokenPayload) {}
 *
 * // For a specific key in the TokenPayload e.g. role
 * \@Mutation(() => Post)
 * \@UseGuards(GqlAccessTokenGuard)
 * createPost(@CurrentUserPayload("role") currentUserRole: UserRole) {}
 * ```
 */
export const CurrentUserPayload = createParamDecorator(
  (data: keyof TokenPayload | undefined, context: ExecutionContext) => {
    const request = GqlExecutionContext.create(context).getContext().req;
    if (!data) {
      return request.user;
    }
    return request.user[data];
  },
);

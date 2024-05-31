import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities';

export const ROLES_KEY = 'roles';

/**
 * Custom decorator to set which `Roles` are allowed to access a method.
 *
 * Use in a resolver where method is decorated with `@UseGuards(GqlAccessTokenGuard, RolesGuard)` or `@UseGuards(GqlRefreshTokenGuard, RolesGuard)`.
 *
 * @param roles - String array of roles that are allowed to access a method
 *
 * @example
 * ```ts
 * \@Query(() => [User])
 * \@UseGuards(GqlAccessTokenGuard, RolesGuard)
 * \@Roles('admin')
 * async getUsers() {
 *  return this.usersService.findAll();
 * }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

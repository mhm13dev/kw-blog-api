import { Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserRole } from './user/entities';
import { Roles } from './user/decorators';
import { GqlAccessTokenGuard, RolesGuard } from './user/guards';
import { AppService } from './app.service';

/**
 * Resolver for operations related to the app.
 */
@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  /**
   * Seeds bulk data for `User`, `BlogPost` and `PostComment` entities.
   * @returns `true` if the bulk data seeding is successful
   */
  @Mutation(() => Boolean)
  @UseGuards(GqlAccessTokenGuard, RolesGuard)
  @Roles(UserRole.admin)
  async seedBulkData(): Promise<boolean> {
    return this.appService.seedBulkData();
  }
}

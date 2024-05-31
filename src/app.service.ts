import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';
import { BlogPostService } from './blog-post/blog-post.service';
import { PostCommentService } from './post-comment/post-comment.service';

/**
 * Service for operations related to the app.
 */
@Injectable()
export class AppService {
  constructor(
    private readonly blogPostService: BlogPostService,
    private readonly postCommentService: PostCommentService,
    private readonly userService: UserService,
  ) {}

  /**
   * Seeds bulk data for `User`, `BlogPost` and `PostComment` entities.
   *
   * - Deletes all `BlogPost` and `PostComment` data
   * - Deletes all `User` data except the admin user
   * - Creates 5 users
   * - Creates 100 `BlogPost` with random data
   * - Creates 500 `PostComment` with random data
   *
   * @returns `true` if the bulk data seeding is successful
   */
  async seedBulkData(): Promise<boolean> {
    // Delete User, BlogPost and PostComment data
    await this.blogPostService.deleteAllBlogPosts();
    await this.postCommentService.deleteAllPostComments();
    await this.userService.deleteAllUsersExceptAdmin();

    // Create 5 users
    const users = await this.userService.createBulkUsers(5);

    // Create BlogPosts
    const blogPosts = await this.blogPostService.createBulkBlogPosts(
      100,
      users,
    );

    // Create PostComments
    await this.postCommentService.createBulkPostComments(500, users, blogPosts);

    return true;
  }
}

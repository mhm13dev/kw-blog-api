import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { GqlAccessTokenGuard } from 'src/auth/guards';
import { CurrentUserPayload } from 'src/auth/decorators';
import { TokenPayload } from 'src/auth/types/jwt.types';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities';
import { UUIDDTO, PaginationInput } from 'src/common/dto';
import { Input } from 'src/common/graphql/args';
import { CreateBlogPostInput, UpdateBlogPostInput } from './dto';
import { BlogPost } from './entities';
import { BlogPostService } from './blog-post.service';

/**
 * Resolver for `BlogPost` entity.
 *
 * This resolver is responsible for handling all the queries and mutations related to the `BlogPost` entity.
 */
@Resolver(() => BlogPost)
export class BlogPostResolver {
  constructor(
    private readonly blogPostService: BlogPostService,
    private readonly userService: UserService,
  ) {}

  /**
   * Mutation to create a new `BlogPost`
   * @param currentUserPayload - Logged in `User` payload
   * @param input - Input data to create a new `BlogPost`
   * @returns Created `BlogPost` object from the database
   */
  @Mutation(() => BlogPost, {
    name: 'createPost',
  })
  @UseGuards(GqlAccessTokenGuard)
  createBlogPost(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
    @Input() input: CreateBlogPostInput,
  ): Promise<BlogPost> {
    return this.blogPostService.createBlogPost(currentUserPayload, input);
  }

  /**
   * Query to get all `BlogPost` from the database with pagination
   * @param input - Pagination options
   * @returns Array of `BlogPost` objects
   */
  @Query(() => [BlogPost], {
    name: 'posts',
  })
  getAllBlogPosts(
    @Args('input', { nullable: true })
    input: PaginationInput,
  ): Promise<BlogPost[]> {
    return this.blogPostService.getAllBlogPosts(input);
  }

  /**
   * Query to get a single `BlogPost` by ID
   * @param input - ID of the `BlogPost`
   * @returns `BlogPost` object from the database
   * @throws `NotFoundException` If the `BlogPost` is not found
   */
  @Query(() => BlogPost, {
    name: 'post',
  })
  async getOneBlogPost(@Input() input: UUIDDTO): Promise<BlogPost> {
    const post = await this.blogPostService.findOneById(input.id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  /**
   * Mutation to update a `BlogPost`
   * @param currentUserPayload - Logged in `User` payload
   * @param input - Input data to update a `BlogPost`
   * @returns Updated `BlogPost` object from the database
   */
  @Mutation(() => BlogPost, {
    name: 'updatePost',
  })
  @UseGuards(GqlAccessTokenGuard)
  updateBlogPost(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
    @Input() input: UpdateBlogPostInput,
  ): Promise<BlogPost> {
    return this.blogPostService.updateBlogPost(currentUserPayload, input);
  }

  /**
   * Mutation to delete a `BlogPost`
   * @param currentUserPayload - Logged in `User` payload
   * @param input - ID of the `BlogPost`
   * @returns `true` if the `BlogPost` is deleted successfully
   */
  @Mutation(() => Boolean, {
    name: 'deletePost',
  })
  @UseGuards(GqlAccessTokenGuard)
  deleteBlogPost(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
    @Input() input: UUIDDTO,
  ): Promise<boolean> {
    return this.blogPostService.deleteBlogPost(currentUserPayload, input.id);
  }

  /**
   * FieldResolver to get the `User` object for the `author` of the `BlogPost`
   * @param post - `BlogPost` object
   * @returns `User` object for the `author` of the `BlogPost`
   * @throws `NotFoundException` If the `User / author` is not found
   */
  @ResolveField('author', () => User)
  async getAuthor(@Parent() post: BlogPost): Promise<User> {
    const author = await this.userService.findOneById(post.author_id);
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    return author;
  }
}

import {
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Input } from 'src/common/graphql/args';
import { GqlAccessTokenGuard } from 'src/auth/guards';
import { CurrentUserPayload } from 'src/auth/decorators';
import { TokenPayload } from 'src/auth/types/jwt.types';
import { User } from 'src/user/entities';
import { UserService } from 'src/user/user.service';
import { BlogPostService } from 'src/blog-post/blog-post.service';
import { BlogPost } from 'src/blog-post/entities';
import { UUIDDTO } from 'src/common/dto';
import { CreatePostCommentInput, GetPostCommentsInput } from './dto';
import { PostComment } from './entities';
import { PostCommentService } from './post-comment.service';

/**
 * Resolver for `PostComment` entity.
 *
 * This resolver is responsible for handling all the queries and mutations related to the `PostComment` entity.
 */
@Resolver(() => PostComment)
export class PostCommentResolver {
  constructor(
    private readonly postCommentService: PostCommentService,
    private readonly userService: UserService,
    private readonly blogPostService: BlogPostService,
  ) {}

  /**
   * Mutation to create a new `PostComment`.
   * @param currentUserPayload - Logged in `User` payload
   * @param input - Input data to create a new `PostComment`
   * @returns Created `PostComment` object from the database
   */
  @Mutation(() => PostComment)
  @UseGuards(GqlAccessTokenGuard)
  createPostComment(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
    @Input() input: CreatePostCommentInput,
  ): Promise<PostComment> {
    return this.postCommentService.createPostComment(currentUserPayload, input);
  }

  /**
   * Query to get all `PostComment` for a `BlogPost` from the database with pagination.
   * @param input - Pagination options
   * @returns Array of `PostComment` objects
   */
  @Query(() => [PostComment], {
    name: 'comments',
  })
  getPostComments(
    @Input() input: GetPostCommentsInput,
  ): Promise<PostComment[]> {
    return this.postCommentService.getPostComments(input);
  }

  /**
   * Mutation to delete a `PostComment`.
   * @param currentUserPayload - Logged in `User` payload
   * @param input - ID of the `PostComment`
   * @returns `true` if the `PostComment` is deleted successfully
   */
  @Mutation(() => Boolean)
  @UseGuards(GqlAccessTokenGuard)
  deletePostComment(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
    @Input() input: UUIDDTO,
  ): Promise<boolean> {
    return this.postCommentService.deletePostComment(
      currentUserPayload,
      input.id,
    );
  }

  /**
   * FieldResolver to get the `author` of the `PostComment`.
   * @param postComment - Parent `PostComment` object
   * @returns `User` object for the `author` of the `PostComment`
   * @throws `NotFoundException` If the `User / author` is not found
   */
  @ResolveField('author', () => User)
  async author(@Parent() postComment: PostComment): Promise<User> {
    const author = await this.userService.findOneById(
      postComment.author_id.toHexString(),
    );
    if (!author) {
      throw new Error('Author not found');
    }
    return author;
  }

  /**
   * FieldResolver to get the `post` to which the `PostComment` belongs.
   * @param postComment - Parent `PostComment` object
   * @returns `BlogPost` object to which the `PostComment` belongs
   * @throws `NotFoundException` If the `BlogPost` is not found
   */
  @ResolveField('post', () => BlogPost)
  async post(@Parent() postComment: PostComment): Promise<BlogPost> {
    const post = await this.blogPostService.findOneById(
      postComment.post_id.toHexString(),
    );
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }

  /**
   * FieldResolver to get the parent `PostComment` to which the `postComment` is a reply.
   * @param postComment - Parent (reply) `postComment` object
   * @returns Parent `PostComment` object to which the `postComment` is a reply.
   *
   * Or `null` if the `postComment` is not a reply to any other `PostComment` i.e. it is a top-level comment.
   */
  @ResolveField('reply_to_comment', () => PostComment, { nullable: true })
  async replyToComment(
    @Parent() postComment: PostComment,
  ): Promise<PostComment | null> {
    if (!postComment.reply_to_comment_id) {
      return null;
    }
    return this.postCommentService.findOneById(
      postComment.reply_to_comment_id.toHexString(),
    );
  }
}

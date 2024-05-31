import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { TokenPayload } from 'src/auth/types/jwt.types';
import { BlogPostService } from 'src/blog-post/blog-post.service';
import { CreatePostCommentInput, GetPostCommentsInput } from './dto';
import { PostComment } from './entities';

/**
 * Service for operations related to `PostComment` entity.
 */
@Injectable()
export class PostCommentService {
  constructor(
    @InjectRepository(PostComment)
    private readonly postCommentRepository: MongoRepository<PostComment>,
    private readonly blogPostService: BlogPostService,
  ) {}

  /**
   * Creates a new `PostComment` and saves it to the database.
   *
   * If the `reply_to_comment_id` is provided, then the comment will be a reply (nested comment) to the comment with the provided `reply_to_comment_id`.
   * Otherwise, the comment will be a top-level comment on the post with the provided `post_id`.
   *
   * @param currentUserPayload - Logged in `User` payload
   * @param input - Input data to create a new `PostComment`
   * @returns Created `PostComment` object from the database
   * @throws `BadRequestException` if the `reply_to_comment_id` or `post_id` is not provided
   * @throws `NotFoundException` if the the entities belonging to `reply_to_comment_id` or `post_id` is not found
   */
  async createPostComment(
    currentUserPayload: TokenPayload,
    input: CreatePostCommentInput,
  ): Promise<PostComment> {
    const postComment = this.postCommentRepository.create({
      author_id: new ObjectId(currentUserPayload.sub),
      content: input.content,
    });

    if (input.reply_to_comment_id) {
      // Get the comment that the user is replying to
      const replyToComment = await this.postCommentRepository.findOneBy({
        _id: input.reply_to_comment_id,
      });
      if (!replyToComment) {
        throw new NotFoundException('Comment not found');
      }
      postComment.reply_to_comment_id = input.reply_to_comment_id;
      postComment.post_id = replyToComment.post_id;
    } else {
      if (!input.post_id) {
        throw new BadRequestException(
          'Either post_id or reply_to_comment_id is required',
        );
      }
      // Get the post that the user is commenting on
      const post = await this.blogPostService.findOneById(
        input.post_id.toHexString(),
      );
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      postComment.post_id = input.post_id;
    }

    return this.postCommentRepository.save(postComment);
  }

  /**
   * Get all `PostComment` for a post with pagination.
   * @param input - Pagination options
   * @returns Array of `PostComment` objects
   */
  getPostComments(input: GetPostCommentsInput): Promise<PostComment[]> {
    return this.postCommentRepository.find({
      where: {
        post_id: input.post_id,
      },
      take: input.limit,
      skip: input.offset,
      order: {
        createdAt: input.sort,
      },
    });
  }

  /**
   * Deletes a `PostComment` from the database.
   *
   * Only the author of the `PostComment` is allowed to delete it.
   *
   * If the deleting `PostComment` has any nested comments, then all the nested comments will be deleted as well by the `PostCommentSubscriber`.
   *
   * @param currentUserPayload - Logged in `User` payload
   * @param commentId - ID of the `PostComment`
   * @returns `true` if the `PostComment` is deleted successfully
   * @throws `NotFoundException` if the `PostComment` is not found
   * @throws `ForbiddenException` if the `User` is not allowed to delete the `PostComment`.
   * i.e. the `User` is not the author of the `PostComment`
   */
  async deletePostComment(
    currentUserPayload: TokenPayload,
    commentId: ObjectId,
  ): Promise<boolean> {
    const postComment = await this.postCommentRepository.findOneBy({
      _id: commentId,
    });
    if (!postComment) {
      throw new NotFoundException('Comment not found');
    }
    if (!postComment.author_id.equals(new ObjectId(currentUserPayload.sub))) {
      throw new ForbiddenException('You are not the author of this comment');
    }
    await this.postCommentRepository.remove(postComment);
    return true;
  }

  /**
   * Get a single `PostComment` by ID.
   * @param id - ID of the `PostComment`
   * @returns `PostComment` if found, `null` otherwise
   */
  findOneById(id: string): Promise<PostComment | null> {
    return this.postCommentRepository.findOneBy({
      _id: new ObjectId(id),
    });
  }
}

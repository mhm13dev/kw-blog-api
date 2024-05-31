import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenPayload } from 'src/user/types/jwt.types';
import { BlogPostService } from 'src/blog-post/blog-post.service';
import { UserService } from 'src/user/user.service';
import { CreatePostCommentInput, GetPostCommentsInput } from './dto';
import { ES_POST_COMMENTS_INDEX } from './constants';
import { PostComment } from './entities';

/**
 * Service for operations related to `PostComment` entity.
 */
@Injectable()
export class PostCommentService {
  constructor(
    @InjectRepository(PostComment)
    private readonly postCommentRepository: Repository<PostComment>,
    private readonly blogPostService: BlogPostService,
    private readonly userService: UserService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  /**
   * Creates a new `PostComment` and saves it to the database and Index it in Elasticsearch.
   *
   * If the `parent_comment_id` is provided, then the comment will be a reply (nested comment) to the comment with the provided `parent_comment_id`.
   * Otherwise, the comment will be a top-level comment on the post with the provided `post_id`.
   *
   * @param currentUserPayload - Logged in `User` payload
   * @param input - Input data to create a new `PostComment`
   * @returns Created `PostComment` object from the database
   * @throws `BadRequestException` if the `parent_comment_id` or `post_id` is not provided
   * @throws `NotFoundException` if the the entities belonging to `parent_comment_id` or `post_id` is not found or the `User / author` is not found
   */
  async createPostComment(
    currentUserPayload: TokenPayload,
    input: CreatePostCommentInput,
  ): Promise<PostComment> {
    const author = await this.userService.findOneById(currentUserPayload.sub);
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const postComment = this.postCommentRepository.create({
      author,
      content: input.content,
    });

    if (input.parent_comment_id) {
      // Get the comment that the user is replying to
      const parentComment = await this.postCommentRepository.findOneBy({
        id: input.parent_comment_id,
      });
      if (!parentComment) {
        throw new NotFoundException('Comment not found');
      }
      postComment.parent_comment_id = input.parent_comment_id;
      postComment.post_id = parentComment.post_id;
    } else {
      if (!input.post_id) {
        throw new BadRequestException(
          'Either post_id or parent_comment_id is required',
        );
      }
      // Get the post that the user is commenting on
      const post = await this.blogPostService.findOneById(input.post_id);
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      postComment.post_id = input.post_id;
    }

    const savedPostComment = await this.postCommentRepository.save(postComment);

    // Index the PostComment in Elasticsearch
    this.indexPostComment(savedPostComment);

    return savedPostComment;
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
        created_at: input.sort,
      },
    });
  }

  /**
   * Deletes a `PostComment` from the database and Elasticsearch (via PostCommentSubscriber).
   *
   * Only the author of the `PostComment` is allowed to delete it.
   *
   * If the deleting `PostComment` has any nested comments, then all the nested comments will be deleted as well by onDelete: 'CASCADE'.
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
    commentId: string,
  ): Promise<boolean> {
    const postComment = await this.postCommentRepository.findOneBy({
      id: commentId,
    });
    if (!postComment) {
      throw new NotFoundException('Comment not found');
    }
    if (postComment.author_id !== currentUserPayload.sub) {
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
      id,
    });
  }

  /**
   * Create or Update the Elasticsearch index for `PostComment`.
   */
  async createOrUpdatePostCommentsIndex(): Promise<void> {
    const indexExists = await this.elasticsearchService.indices.exists({
      index: ES_POST_COMMENTS_INDEX,
    });

    const mappings: MappingTypeMapping = {
      properties: {
        id: { type: 'keyword' },
        content: { type: 'text' },
        post_id: { type: 'keyword' },
        parent_comment_id: { type: 'keyword' },
        author: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text' },
          },
        },
      },
    };

    if (!indexExists) {
      await this.elasticsearchService.indices.create({
        index: ES_POST_COMMENTS_INDEX,
        body: {
          mappings,
        },
      });
    } else {
      await this.elasticsearchService.indices.putMapping({
        index: ES_POST_COMMENTS_INDEX,
        body: {
          properties: mappings.properties,
        },
      });
    }
  }

  /**
   * Index `PostComment` in Elasticsearch.
   * @param postComment - `PostComment` object with populated `author`
   */
  indexPostComment(postComment: PostComment): void {
    this.elasticsearchService.index({
      index: ES_POST_COMMENTS_INDEX,
      id: postComment.id,
      body: {
        id: postComment.id,
        content: postComment.content,
        post_id: postComment.post_id,
        parent_comment_id: postComment.parent_comment_id,
        author: {
          id: postComment.author_id,
          name: postComment.author.name,
        },
      },
    });
  }
}

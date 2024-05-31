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
import { faker } from '@faker-js/faker';
import { BlogPostService } from 'src/blog-post/blog-post.service';
import { BlogPost } from 'src/blog-post/entities';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities';
import { TokenPayload } from 'src/user/types/jwt.types';
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
   * Creates a new `PostComment` and saves it to the database and Index it in Elasticsearch (via PostCommentSubscriber).
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
   * Delete all `PostComment` from the database and Elasticsearch
   *
   * Intended to be used by `admin` only for seeding data.
   *
   * @returns `true` if all `PostComment` are deleted successfully
   */
  async deleteAllPostComments(): Promise<boolean> {
    await this.postCommentRepository.delete({});
    await this.elasticsearchService.deleteByQuery({
      index: ES_POST_COMMENTS_INDEX,
      query: {
        match_all: {},
      },
    });
    return true;
  }

  /**
   * Create multiple `PostComment` data
   *
   * Intended to be used by `admin` only for seeding data.
   *
   * @param count - Number of `PostComment` to create
   * @param users - Array of `User`
   * @param blogPosts - Array of `BlogPost`
   * @returns Array of created `PostComment`
   */
  async createBulkPostComments(
    count: number,
    users: User[],
    blogPosts: BlogPost[],
  ): Promise<PostComment[]> {
    const postComments: PostComment[] = [];
    for (let i = 0; i < count; i++) {
      const postComment = new PostComment();
      postComment.id = faker.string.uuid();
      postComment.content = faker.lorem.paragraph();
      postComment.author = users[Math.floor(Math.random() * users.length)];
      if (Math.random() > 0.5 && postComments.length > 0) {
        postComment.parent_comment =
          postComments[Math.floor(Math.random() * postComments.length)];
        postComment.post = postComment.parent_comment.post;
      } else {
        postComment.post =
          blogPosts[Math.floor(Math.random() * blogPosts.length)];
      }
      postComments.push(await this.postCommentRepository.save(postComment));
    }
    return postComments;
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
}

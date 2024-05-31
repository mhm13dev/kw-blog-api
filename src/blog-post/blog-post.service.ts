import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { TokenPayload } from 'src/user/types/jwt.types';
import { PaginationInput } from 'src/common/dto';
import { CreateBlogPostInput, UpdateBlogPostInput } from './dto';
import { ES_BLOG_POSTS_INDEX } from './constants';
import { BlogPost } from './entities';

/**
 * Service for operations related to `BlogPost` entity.
 */
@Injectable()
export class BlogPostService {
  constructor(
    @InjectRepository(BlogPost)
    private blogPostRepository: Repository<BlogPost>,
    private readonly userService: UserService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  /**
   * Creates a new `BlogPost` and Index it in Elasticsearch
   * @param currentUserPayload - Logged in `User` payload
   * @param input - Input data to create a new `BlogPost`
   * @returns Created `BlogPost` object from the database
   * @throws `NotFoundException` If the `User / author` is not found
   */
  async createBlogPost(
    currentUserPayload: TokenPayload,
    input: CreateBlogPostInput,
  ): Promise<BlogPost> {
    const author = await this.userService.findOneById(currentUserPayload.sub);
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const blogPost = this.blogPostRepository.create({
      author,
      title: input.title,
      content: input.content,
    });

    const savedBlogPost = await this.blogPostRepository.save(blogPost);

    // Index the blog post in Elasticsearch
    this.indexBlogPost(savedBlogPost);

    return savedBlogPost;
  }

  /**
   * Get all `BlogPost` from the database with pagination
   * @param input - Pagination options
   * @returns Array of `BlogPost` objects
   */
  getAllBlogPosts({
    limit,
    offset,
    sort,
  }: PaginationInput): Promise<BlogPost[]> {
    return this.blogPostRepository.find({
      order: {
        created_at: sort,
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get a single `BlogPost` by ID
   * @param id - ID of the `BlogPost`
   * @returns `BlogPost` if found, `null` otherwise
   */
  findOneById(id: string): Promise<BlogPost | null> {
    return this.blogPostRepository.findOneBy({
      id,
    });
  }

  /**
   * Update a `BlogPost` in Database and Elasticsearch
   *
   * Only the `author` of the `BlogPost` is allowed to update it.
   *
   * Only `title` and `content` fields can be updated.
   *
   * @param currentUserPayload - Logged in `User` payload
   * @param input - Input data to update the `BlogPost`
   * @returns Updated `BlogPost` object from the database
   * @throws `ForbiddenException` If the `User` is not allowed to update the `BlogPost`
   * @throws `NotFoundException` If the `BlogPost` is not found
   */
  async updateBlogPost(
    currentUserPayload: TokenPayload,
    input: UpdateBlogPostInput,
  ): Promise<BlogPost> {
    const blogPost = await this.blogPostRepository.findOne({
      where: {
        id: input.id,
      },
      relations: ['author'],
    });

    if (!blogPost) {
      throw new NotFoundException('Post not found');
    }

    if (blogPost.author_id !== currentUserPayload.sub) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    const updatedBlogPost = this.blogPostRepository.merge(blogPost, {
      title: input.title,
      content: input.content,
    });

    const savedUpdatedBlogPost =
      await this.blogPostRepository.save(updatedBlogPost);

    // Index the updated BlogPost in Elasticsearch
    this.indexBlogPost(savedUpdatedBlogPost);

    return savedUpdatedBlogPost;
  }

  /**
   * Delete a `BlogPost` from Database and Elasticsearch
   *
   * Only the `author` of the `BlogPost` is allowed to delete it.
   *
   * All the associated `PostComment` with the `BlogPost` will be deleted by onDelete: 'CASCADE'.
   *
   * @param currentUserPayload - Logged in `User` payload
   * @param id - ID of the `BlogPost`
   * @returns `true` if the `BlogPost` is deleted successfully
   * @throws `NotFoundException` If the `BlogPost` is not found
   * @throws `ForbiddenException` If the `User` is not the `author` of the `BlogPost`
   */
  async deleteBlogPost(
    currentUserPayload: TokenPayload,
    id: string,
  ): Promise<boolean> {
    const blogPost = await this.blogPostRepository.findOneBy({
      id,
    });
    if (!blogPost) {
      throw new NotFoundException('Post not found');
    }
    if (blogPost.author_id !== currentUserPayload.sub) {
      throw new ForbiddenException('You are not the author of this post');
    }
    await this.blogPostRepository.remove(blogPost);
    this.removeBlogPostFromIndex(id);
    return true;
  }

  /**
   * Create or Update the Elasticsearch index for `BlogPost`
   */
  async createOrUpdateBlogPostsIndex(): Promise<void> {
    const indexExists = await this.elasticsearchService.indices.exists({
      index: ES_BLOG_POSTS_INDEX,
    });

    const mappings: MappingTypeMapping = {
      properties: {
        title: { type: 'text' },
        content: { type: 'text' },
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
        index: ES_BLOG_POSTS_INDEX,
        body: {
          mappings,
        },
      });
    } else {
      await this.elasticsearchService.indices.putMapping({
        index: ES_BLOG_POSTS_INDEX,
        body: mappings,
      });
    }
  }

  /**
   * Index `BlogPost` in Elasticsearch
   * @param blogPost - `BlogPost` object with populated `author`
   */
  indexBlogPost(blogPost: BlogPost): void {
    this.elasticsearchService.update({
      index: ES_BLOG_POSTS_INDEX,
      id: blogPost.id,
      doc: {
        title: blogPost.title,
        content: blogPost.content,
        author: {
          id: blogPost.author.id,
          name: blogPost.author.name,
        },
      },
      doc_as_upsert: true,
    });
  }

  /**
   * Remove `BlogPost` from Elasticsearch
   * @param id - ID of the `BlogPost`
   */
  removeBlogPostFromIndex(id: string): void {
    this.elasticsearchService.delete({
      index: ES_BLOG_POSTS_INDEX,
      id,
    });
  }
}

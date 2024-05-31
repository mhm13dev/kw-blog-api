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
import { ObjectIdDto, PaginationInput } from 'src/common/dto';
import { Input } from 'src/common/graphql/args';
import { CreateBlogPostInput, UpdateBlogPostInput } from './dto';
import { BlogPost } from './entities';
import { BlogPostService } from './blog-post.service';

@Resolver(() => BlogPost)
export class BlogPostResolver {
  constructor(
    private readonly blogPostService: BlogPostService,
    private readonly userService: UserService,
  ) {}

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

  @Query(() => [BlogPost], {
    name: 'posts',
  })
  getAllBlogPosts(
    @Args('input', { nullable: true })
    input: PaginationInput,
  ): Promise<BlogPost[]> {
    return this.blogPostService.getAllBlogPosts(input);
  }

  @Query(() => BlogPost, {
    name: 'post',
  })
  async getOneBlogPost(@Input() input: ObjectIdDto): Promise<BlogPost> {
    const post = await this.blogPostService.findOneById(
      input._id.toHexString(),
    );
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  @ResolveField('author', () => User)
  getAuthor(@Parent() post: BlogPost): Promise<User> {
    return this.userService.findOneById(post.author_id.toHexString());
  }

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

  @Mutation(() => Boolean, {
    name: 'deletePost',
  })
  @UseGuards(GqlAccessTokenGuard)
  async deleteBlogPost(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
    @Input() input: ObjectIdDto,
  ): Promise<boolean> {
    await this.blogPostService.deleteBlogPost(
      currentUserPayload,
      input._id.toHexString(),
    );
    return true;
  }
}

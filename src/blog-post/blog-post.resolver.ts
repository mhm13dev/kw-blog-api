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
import { ObjectIdDto } from 'src/common/dto';
import {
  CreateBlogPostInput,
  GetAllBlogPostsInput,
  UpdateBlogPostInput,
} from './dto';
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
    @Args('createBlogPostInput') createBlogPostInput: CreateBlogPostInput,
  ): Promise<BlogPost> {
    return this.blogPostService.createBlogPost(
      currentUserPayload,
      createBlogPostInput,
    );
  }

  @Query(() => [BlogPost], {
    name: 'posts',
  })
  getAllBlogPosts(
    @Args('getAllBlogPostsInput', { nullable: true })
    getAllBlogPostsInput: GetAllBlogPostsInput,
  ): Promise<BlogPost[]> {
    return this.blogPostService.getAllBlogPosts(getAllBlogPostsInput);
  }

  @Query(() => BlogPost, {
    name: 'post',
  })
  async getOneBlogPost(@Args('_id') _id: string): Promise<BlogPost> {
    const post = await this.blogPostService.findOneById(_id);
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
    @Args('updateBlogPostInput') updateBlogPostInput: UpdateBlogPostInput,
  ): Promise<BlogPost> {
    return this.blogPostService.updateBlogPost(
      currentUserPayload,
      updateBlogPostInput,
    );
  }

  @Mutation(() => Boolean, {
    name: 'deletePost',
  })
  @UseGuards(GqlAccessTokenGuard)
  async deleteBlogPost(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
    @Args('deleteBlogPostInput') deleteBlogPostInput: ObjectIdDto,
  ): Promise<boolean> {
    await this.blogPostService.deleteBlogPost(
      currentUserPayload,
      deleteBlogPostInput._id,
    );
    return true;
  }
}

import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { GqlAccessTokenGuard } from 'src/auth/guards';
import { CurrentUserPayload } from 'src/auth/decorators';
import { TokenPayload } from 'src/auth/types/jwt.types';
import { CreateBlogPostInput, GetAllBlogPostsInput } from './dto';
import { BlogPost } from './entities';
import { BlogPostService } from './blog-post.service';

@Resolver(() => BlogPost)
export class BlogPostResolver {
  constructor(private readonly blogPostService: BlogPostService) {}

  @Mutation(() => BlogPost)
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
}

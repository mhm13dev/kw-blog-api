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
import { CreatePostCommentInput, GetPostCommentsInput } from './dto';
import { PostComment } from './entities';
import { PostCommentService } from './post-comment.service';

@Resolver(() => PostComment)
export class PostCommentResolver {
  constructor(
    private readonly postCommentService: PostCommentService,
    private readonly userService: UserService,
    private readonly blogPostService: BlogPostService,
  ) {}

  @Mutation(() => PostComment)
  @UseGuards(GqlAccessTokenGuard)
  createPostComment(
    @CurrentUserPayload() currentUserPayload: TokenPayload,
    @Input() input: CreatePostCommentInput,
  ): Promise<PostComment> {
    return this.postCommentService.createPostComment(currentUserPayload, input);
  }

  @Query(() => [PostComment], {
    name: 'comments',
  })
  getPostComments(
    @Input() input: GetPostCommentsInput,
  ): Promise<PostComment[]> {
    return this.postCommentService.getPostComments(input);
  }

  @ResolveField('author', () => User)
  async author(@Parent() postComment: PostComment): Promise<User> {
    return this.userService.findOneById(postComment.author_id.toHexString());
  }

  @ResolveField('post', () => BlogPost)
  async post(@Parent() postComment: PostComment): Promise<BlogPost> {
    return this.blogPostService.findOneById(postComment.post_id.toHexString());
  }

  @ResolveField('reply_to_comment', () => PostComment, { nullable: true })
  async replyToComment(
    @Parent() postComment: PostComment,
  ): Promise<PostComment> {
    if (!postComment.reply_to_comment_id) {
      return null;
    }
    return this.postCommentService.findOneById(
      postComment.reply_to_comment_id.toHexString(),
    );
  }
}

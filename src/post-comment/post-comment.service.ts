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

@Injectable()
export class PostCommentService {
  constructor(
    @InjectRepository(PostComment)
    private readonly postCommentRepository: MongoRepository<PostComment>,
    private readonly blogPostService: BlogPostService,
  ) {}

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
        throw new BadRequestException('Comment not found');
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
        throw new BadRequestException('Post not found');
      }
      postComment.post_id = input.post_id;
    }

    return this.postCommentRepository.save(postComment);
  }

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
    // INFO: all the nested comments will be removed by the PostCommentSubscriber
    await this.postCommentRepository.remove(postComment);
    return true;
  }

  findOneById(id: string): Promise<PostComment> {
    return this.postCommentRepository.findOneBy({
      _id: new ObjectId(id),
    });
  }
}

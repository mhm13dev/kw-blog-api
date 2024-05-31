import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { TokenPayload } from 'src/auth/types/jwt.types';
import { BlogPostService } from 'src/blog-post/blog-post.service';
import { CreatePostCommentInput } from './dto';
import { PostComment } from './entities';

@Injectable()
export class PostCommentService {
  constructor(
    @InjectRepository(PostComment)
    private readonly postCommentRepository: Repository<PostComment>,
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

  findOneById(id: string): Promise<PostComment> {
    return this.postCommentRepository.findOneBy({
      _id: new ObjectId(id),
    });
  }
}

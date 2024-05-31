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
    // If the comment has nested comments, delete them as well
    await this.deleteCommentAndAllNestedComments(postComment._id);
    return true;
  }

  private async deleteCommentAndAllNestedComments(commentId: ObjectId) {
    const commentIdsToDelete: ObjectId[] = [commentId];

    async function recurse(
      commentId: ObjectId,
      postCommentRepository: MongoRepository<PostComment>,
      commentIdsToDelete: ObjectId[],
    ) {
      // Get all comments that are replying to the comment
      const comments = await postCommentRepository.find({
        where: {
          reply_to_comment_id: commentId,
        },
      });
      if (comments.length === 0) {
        return;
      }
      // Recursively delete all nested comments
      for (const comment of comments) {
        commentIdsToDelete.push(comment._id);
        await recurse(comment._id, postCommentRepository, commentIdsToDelete);
      }
    }
    await recurse(commentId, this.postCommentRepository, commentIdsToDelete);

    // Delete all comments
    await this.postCommentRepository.deleteMany({
      _id: { $in: commentIdsToDelete },
    });
  }

  findOneById(id: string): Promise<PostComment> {
    return this.postCommentRepository.findOneBy({
      _id: new ObjectId(id),
    });
  }
}

import {
  InputType,
  IntersectionType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { PostComment } from '../entities';

@InputType()
export class CreatePostCommentInput extends IntersectionType(
  PartialType(
    PickType(PostComment, ['post_id', 'reply_to_comment_id'] as const),
  ),
  PickType(PostComment, ['content'] as const),
  InputType,
) {}

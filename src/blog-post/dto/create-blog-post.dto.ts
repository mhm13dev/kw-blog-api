import { InputType, PickType } from '@nestjs/graphql';
import { BlogPost } from '../entities';

@InputType()
export class CreateBlogPostInput extends PickType(
  BlogPost,
  ['title', 'content'],
  InputType,
) {}

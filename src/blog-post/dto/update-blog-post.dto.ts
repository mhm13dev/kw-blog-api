import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';
import { BlogPost } from '../entities';

@InputType()
export class UpdateBlogPostInput extends PickType(
  PartialType(BlogPost),
  ['title', 'content'],
  InputType,
) {
  @Field()
  @IsMongoId()
  _id: string;
}

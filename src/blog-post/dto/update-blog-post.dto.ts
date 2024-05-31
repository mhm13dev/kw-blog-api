import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { ObjectId } from 'mongodb';
import { ToMongoObjectId } from 'src/common/transformers';
import { IsMongoObjectId } from 'src/common/validators';
import { BlogPost } from '../entities';

@InputType()
export class UpdateBlogPostInput extends PickType(
  PartialType(BlogPost),
  ['title', 'content'],
  InputType,
) {
  @Field(() => String)
  @IsMongoObjectId()
  @ToMongoObjectId()
  _id: ObjectId;
}

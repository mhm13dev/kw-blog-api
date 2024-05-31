import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongodb';
import { PaginationInput } from 'src/common/dto';
import { ToMongoObjectId } from 'src/common/transformers';
import { IsMongoObjectId } from 'src/common/validators';

@InputType()
export class GetPostCommentsInput extends PaginationInput {
  @Field(() => String)
  @IsMongoObjectId()
  @ToMongoObjectId()
  post_id: ObjectId;
}

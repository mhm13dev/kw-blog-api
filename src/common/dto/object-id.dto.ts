import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongodb';
import { ToMongoObjectId } from '../transformers';
import { IsMongoObjectId } from '../validators';

@InputType()
export class ObjectIdDto {
  @Field(() => String)
  @IsMongoObjectId()
  @ToMongoObjectId()
  _id: ObjectId;
}

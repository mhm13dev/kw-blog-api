import { Field, InputType } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@InputType()
export class ObjectIdDto {
  @Field()
  @IsMongoId()
  _id: string;
}

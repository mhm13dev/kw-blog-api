import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { PaginationInput } from 'src/common/dto';

@InputType()
export class GetPostCommentsInput extends PaginationInput {
  @Field(() => String)
  @IsUUID()
  post_id: string;
}

import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsInt, Max, Min } from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

@InputType()
export class GetAllBlogPostsInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  offset: number = 0;

  @Field(() => SortOrder, { nullable: true })
  @IsEnum(SortOrder)
  sort: SortOrder = SortOrder.DESC;
}

import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/user/entities';
import { BlogPost } from 'src/blog-post/entities';
import { PostComment } from 'src/post-comment/entities';

@InputType()
export class SearchInputDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  query: string;
}

@ObjectType()
class SearchUserResponse extends PickType(User, ['id', 'name']) {}

@ObjectType()
class SearchPostResponse extends PickType(BlogPost, [
  'id',
  'title',
  'content',
]) {
  @Field(() => SearchUserResponse)
  author: SearchUserResponse;
}

@ObjectType()
class SearchCommentResponse extends PickType(PostComment, ['id', 'content']) {
  @Field(() => SearchUserResponse)
  author: SearchUserResponse;

  @Field(() => String)
  post_id: string;

  @Field(() => String, { nullable: true })
  parent_comment_id: string;
}

@ObjectType()
export class SearchResponseDto {
  @Field(() => [SearchPostResponse])
  posts: SearchPostResponse[];

  @Field(() => [SearchCommentResponse])
  comments: SearchCommentResponse[];
}

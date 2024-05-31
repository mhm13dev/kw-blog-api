import {
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  PickType,
  createUnionType,
} from '@nestjs/graphql';
import { SortResults } from '@elastic/elasticsearch/lib/api/types';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { User } from 'src/user/entities';
import { BlogPost } from 'src/blog-post/entities';
import { PostComment } from 'src/post-comment/entities';
import { ES_BLOG_POSTS_INDEX } from 'src/blog-post/constants';
import { ES_POST_COMMENTS_INDEX } from 'src/post-comment/constants';

@InputType()
export class SearchInputDto {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  query: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(50)
  size: number = 10;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  pit_id?: string;

  @Field(() => [Float], { nullable: true })
  @IsNumber({}, { each: true })
  @IsOptional()
  search_after?: number[];
}

@ObjectType()
class SearchUser extends PickType(User, ['id', 'name']) {}

@ObjectType()
class SearchBlogPostSource extends PickType(BlogPost, [
  'id',
  'title',
  'content',
]) {
  @Field(() => SearchUser)
  author: SearchUser;
}

@ObjectType()
class SearchPostCommentSource extends PickType(PostComment, ['id', 'content']) {
  @Field(() => SearchUser)
  author: SearchUser;

  @Field(() => String)
  post_id: string;

  @Field(() => String, { nullable: true })
  parent_comment_id?: string;
}

@ObjectType()
export class SearchBlogPost {
  @Field(() => SearchBlogPostSource)
  _source: SearchBlogPostSource;

  @Field(() => [Float])
  _sort: SortResults;

  @Field(() => String)
  _index: typeof ES_BLOG_POSTS_INDEX;
}

@ObjectType()
export class SearchPostComment {
  @Field(() => SearchPostCommentSource)
  _source: SearchPostCommentSource;

  @Field(() => [Float])
  _sort: SortResults;

  @Field(() => String)
  _index: typeof ES_POST_COMMENTS_INDEX;
}

const SearchResult = createUnionType({
  name: 'SearchResult',
  types: () => [SearchBlogPost, SearchPostComment] as const,
  resolveType(value) {
    if (value._index === ES_BLOG_POSTS_INDEX) {
      return SearchBlogPost;
    }
    if (value._index === ES_POST_COMMENTS_INDEX) {
      return SearchPostComment;
    }
    return null;
  },
});

@ObjectType()
export class SearchResponseDto {
  @Field(() => [SearchResult])
  results: Array<typeof SearchResult>;

  @Field(() => String)
  pit_id: string;
}

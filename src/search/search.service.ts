import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { ES_BLOG_POSTS_INDEX } from 'src/blog-post/constants';
import { ES_POST_COMMENTS_INDEX } from 'src/post-comment/constants';
import { SearchInputDto, SearchResponseDto } from './dto';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search(input: SearchInputDto): Promise<SearchResponseDto> {
    const { responses } = await this.elasticsearchService.msearch({
      searches: [
        { index: ES_BLOG_POSTS_INDEX },
        {
          query: {
            multi_match: {
              query: input.query,
              fields: ['title', 'content', 'author.name'],
            },
          },
        },
        { index: ES_POST_COMMENTS_INDEX },
        {
          query: {
            multi_match: {
              query: input.query,
              fields: ['content', 'author.name'],
            },
          },
        },
      ],
    });

    const blogPostRes = responses[0] as SearchResponse<
      SearchResponseDto['posts'][0]
    >;
    const postCommentRes = responses[1] as SearchResponse<
      SearchResponseDto['comments'][0]
    >;

    return {
      posts: blogPostRes.hits.hits
        .filter((hit) => !!hit._source)
        .map((hit) => hit._source!),
      comments: postCommentRes.hits.hits
        .filter((hit) => !!hit._source)
        .map((hit) => hit._source!),
    };
  }
}

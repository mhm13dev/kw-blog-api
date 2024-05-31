import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { ES_BLOG_POSTS_INDEX } from 'src/blog-post/constants';
import { ES_POST_COMMENTS_INDEX } from 'src/post-comment/constants';
import {
  SearchBlogPost,
  SearchPostComment,
  SearchInputDto,
  SearchResponseDto,
} from './dto';

/**
 * Service for searching `BlogPosts` and `PostComments` using the Elasticsearch.
 */
@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  /**
   * Open a new `Point in Time` (PIT) in Elasticsearch.
   *
   * PIT is used to search the data in the same state as it was when the PIT was opened. It avoids the data changes during the search with pagination.
   *
   * @returns Object containing the `pid_id` of the opened PIT
   */
  async openPIT(): Promise<{
    pid_id: string;
  }> {
    const pit = await this.elasticsearchService.openPointInTime({
      index: [ES_BLOG_POSTS_INDEX, ES_POST_COMMENTS_INDEX],
      keep_alive: '5m',
    });

    return {
      pid_id: pit.id,
    };
  }

  /**
   * Search `BlogPosts` and `PostComments`.
   *
   * It uses `multi_match` query to search the `query` in the `title`, `content`, and `author.name` fields from `blog_posts` and `post_comments` indices.
   *
   * We are paginating the search results using the `size`, `search_after` and `pit_id` parameters.
   *
   * @param input - Input data to search `BlogPosts` and `PostComments`
   * @returns Search Response
   */
  async search({
    query,
    pit_id,
    search_after,
    size,
  }: SearchInputDto): Promise<SearchResponseDto> {
    const body: SearchRequest = {
      query: {
        multi_match: {
          query,
          fields: ['title', 'content', 'author.name'],
        },
      },
      indices_boost: [
        { [ES_BLOG_POSTS_INDEX]: 2 },
        { [ES_POST_COMMENTS_INDEX]: 1 },
      ],
      sort: {
        _score: {
          order: 'desc',
        },
      },
      size,
      pit: {
        id: pit_id!,
        keep_alive: '5m',
      },
    };

    if (search_after) {
      body['search_after'] = search_after;
    }

    const response = await this.elasticsearchService.search<
      SearchBlogPost['_source'] | SearchPostComment['_source']
    >(body);

    const resp = {
      results: response.hits.hits.map((hit) => {
        if (
          hit._index === ES_BLOG_POSTS_INDEX ||
          hit._index === ES_POST_COMMENTS_INDEX
        ) {
          return {
            _source: hit._source,
            _sort: hit.sort,
            _index: hit._index,
          };
        } else {
          throw new Error(`Unknown index: ${hit._index}`);
        }
      }) as (SearchBlogPost | SearchPostComment)[],
      pit_id: response.pit_id!,
    };

    return resp;
  }
}

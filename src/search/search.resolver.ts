import { Query, Resolver } from '@nestjs/graphql';
import { Input } from 'src/common/graphql/args';
import { SearchService } from './search.service';
import { SearchInputDto, SearchResponseDto } from './dto';

/**
 * Resolver for searching `BlogPosts` and `PostComments` using the Elasticsearch.
 */
@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Query to search `BlogPosts` and `PostComments`.
   *
   * It opens a new `Point in Time` (PIT) if `pit_id` is not provided in the input.
   *
   * @param input - Input data to search `BlogPosts` and `PostComments`
   * @returns Search Response
   */
  @Query(() => SearchResponseDto)
  async search(
    @Input()
    input: SearchInputDto,
  ): Promise<SearchResponseDto> {
    if (!input.pit_id) {
      const { pid_id } = await this.searchService.openPIT();
      input.pit_id = pid_id;
    }

    try {
      return await this.searchService.search(input);
    } catch (error) {
      if (
        error.meta?.body?.status === 404 &&
        error.toString().includes('search_context_missing_exception')
      ) {
        const { pid_id } = await this.searchService.openPIT();
        input.pit_id = pid_id;
        return await this.searchService.search(input);
      }
      throw error;
    }
  }
}

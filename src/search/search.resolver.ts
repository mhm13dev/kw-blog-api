import { Query, Resolver } from '@nestjs/graphql';
import { Input } from 'src/common/graphql/args';
import { SearchService } from './search.service';
import { SearchInputDto, SearchResponseDto } from './dto';

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

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

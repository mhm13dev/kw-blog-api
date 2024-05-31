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
    return this.searchService.search(input);
  }
}

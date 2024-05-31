import { Module } from '@nestjs/common';
import { ElasticsearchModule } from 'src/elasticsearch/elasticsearch.module';
import { SearchService } from './search.service';
import { SearchResolver } from './search.resolver';

@Module({
  imports: [ElasticsearchModule],
  providers: [SearchResolver, SearchService],
})
export class SearchModule {}

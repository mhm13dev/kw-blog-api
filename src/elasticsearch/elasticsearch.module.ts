import { Module } from '@nestjs/common';
import { ElasticsearchModule as ElasticsearchBaseModule } from '@nestjs/elasticsearch';
import { AppConfigService } from 'src/config/config.service';

/**
 * Module for connecting to the Elasticsearch once to avoid creating connections in each module.
 *
 * Instead of importing `ElasticsearchModule` from `@nestjs/elasticsearch` in each module, we can import this module and use it across the application.
 */
@Module({
  imports: [
    ElasticsearchBaseModule.registerAsync({
      useFactory: (appConfigService: AppConfigService) => {
        return appConfigService.database.ELASTIC_SEARCH;
      },
      inject: [AppConfigService],
    }),
  ],
  exports: [ElasticsearchBaseModule],
})
export class ElasticsearchModule {}

import { Module } from '@nestjs/common';
import { ElasticsearchModule as ElasticsearchBaseModule } from '@nestjs/elasticsearch';
import { AppConfigService } from 'src/config/config.service';

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

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { AppConfigService } from 'src/config/config.service';
import { UserModule } from 'src/user/user.module';
import { BlogPost } from './entities';
import { BlogPostService } from './blog-post.service';
import { BlogPostResolver } from './blog-post.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogPost]),
    UserModule,
    ElasticsearchModule.registerAsync({
      useFactory: (appConfigService: AppConfigService) => {
        return appConfigService.database.ELASTIC_SEARCH;
      },
      inject: [AppConfigService],
    }),
  ],
  providers: [BlogPostResolver, BlogPostService],
  exports: [BlogPostService],
})
export class BlogPostModule {}

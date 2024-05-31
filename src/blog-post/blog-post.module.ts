import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ElasticsearchModule } from 'src/elasticsearch/elasticsearch.module';
import { BlogPost } from './entities';
import { BlogPostService } from './blog-post.service';
import { BlogPostResolver } from './blog-post.resolver';
import { BlogPostSubscriber } from './blog-post.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogPost]),
    UserModule,
    ElasticsearchModule,
  ],
  providers: [BlogPostResolver, BlogPostService, BlogPostSubscriber],
  exports: [BlogPostService],
})
export class BlogPostModule implements OnModuleInit {
  constructor(private readonly blogPostService: BlogPostService) {}

  async onModuleInit(): Promise<void> {
    await this.blogPostService.createOrUpdateBlogPostsIndex();
  }
}

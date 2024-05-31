import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { BlogPostModule } from 'src/blog-post/blog-post.module';
import { ElasticsearchModule } from 'src/elasticsearch/elasticsearch.module';
import { PostCommentService } from './post-comment.service';
import { PostCommentResolver } from './post-comment.resolver';
import { PostComment } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostComment]),
    UserModule,
    BlogPostModule,
    ElasticsearchModule,
  ],
  providers: [PostCommentResolver, PostCommentService],
})
export class PostCommentModule implements OnModuleInit {
  constructor(private readonly postCommentService: PostCommentService) {}

  async onModuleInit(): Promise<void> {
    await this.postCommentService.createOrUpdatePostCommentsIndex();
  }
}

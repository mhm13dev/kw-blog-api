import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './entities';
import { BlogPostService } from './blog-post.service';
import { BlogPostResolver } from './blog-post.resolver';

@Module({
  providers: [BlogPostResolver, BlogPostService],
  imports: [TypeOrmModule.forFeature([BlogPost])],
})
export class BlogPostModule {}

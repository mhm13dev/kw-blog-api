import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { BlogPost } from './entities';
import { BlogPostService } from './blog-post.service';
import { BlogPostResolver } from './blog-post.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost]), UserModule],
  providers: [BlogPostResolver, BlogPostService],
  exports: [BlogPostService],
})
export class BlogPostModule {}

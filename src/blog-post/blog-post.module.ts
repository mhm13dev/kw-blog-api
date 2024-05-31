import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { BlogPost } from './entities';
import { BlogPostService } from './blog-post.service';
import { BlogPostResolver } from './blog-post.resolver';

@Module({
  providers: [BlogPostResolver, BlogPostService],
  imports: [TypeOrmModule.forFeature([BlogPost]), UserModule],
})
export class BlogPostModule {}

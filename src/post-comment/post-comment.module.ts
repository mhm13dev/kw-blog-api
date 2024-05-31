import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { BlogPostModule } from 'src/blog-post/blog-post.module';
import { PostCommentService } from './post-comment.service';
import { PostCommentResolver } from './post-comment.resolver';
import { PostComment } from './entities';

@Module({
  providers: [PostCommentResolver, PostCommentService],
  imports: [
    TypeOrmModule.forFeature([PostComment]),
    UserModule,
    BlogPostModule,
  ],
})
export class PostCommentModule {}

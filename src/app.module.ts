import { join } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { UserModule } from './user/user.module';
import { BlogPostModule } from './blog-post/blog-post.module';
import { PostCommentModule } from './post-comment/post-comment.module';
import { SearchModule } from './search/search.module';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';

@Module({
  imports: [
    AppConfigModule.register(),
    TypeOrmModule.forRootAsync({
      useFactory: (appConfigService: AppConfigService) => {
        return appConfigService.database.POSTGRES;
      },
      inject: [AppConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    UserModule,
    BlogPostModule,
    PostCommentModule,
    SearchModule,
  ],
  providers: [AppService, AppResolver],
})
export class AppModule {}

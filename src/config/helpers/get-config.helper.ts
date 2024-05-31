import { BlogPostSubscriber } from 'src/blog-post/subscribers';
import { PostCommentSubscriber } from 'src/post-comment/subscribers';
import { IConfig } from '../types/config.interface';
import { NodeEnv } from '../types/common.enum';

/**
 * This is a custom configuration function that returns the configuration object available via the `ConfigService`.
 */
export function getConfig(): IConfig {
  return {
    core: {
      NODE_ENV: (process.env.NODE_ENV ?? 'development') as NodeEnv,
      PORT: parseInt(process.env.PORT!, 10) || 5001,
    },
    database: {
      MONGODB: {
        type: 'mongodb',
        username: process.env.MONGO_INITDB_ROOT_USERNAME,
        password: process.env.MONGO_INITDB_ROOT_PASSWORD,
        host: process.env.MONGO_HOST,
        port: parseInt(process.env.MONGO_PORT!, 10),
        database: process.env.MONGO_DATABASE,
        authSource: 'admin',
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        subscribers: [BlogPostSubscriber, PostCommentSubscriber],
      },
    },
    auth: {
      ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
      ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION!,
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
      REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION!,
    },
  };
}

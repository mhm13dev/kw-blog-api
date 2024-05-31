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
      POSTGRES: {
        type: 'postgres',
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT!, 10),
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

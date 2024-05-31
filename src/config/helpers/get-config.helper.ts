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
        synchronize: false, // It's better to generate and run migrations when entities change
      },
      ELASTIC_SEARCH: {
        node: `http://${process.env.ELASTIC_SEARCH_HOST}:${process.env.ELASTIC_SEARCH_PORT}`,
        auth: {
          apiKey: {
            id: process.env.ELASTIC_SEARCH_API_KEY_ID!,
            api_key: process.env.ELASTIC_SEARCH_API_KEY!,
          },
        },
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

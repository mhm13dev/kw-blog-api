import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { NodeEnv } from './common.enum';

/**
 * This interface defines the configuration object available via the `ConfigService`.
 */
export interface IConfig {
  core: {
    NODE_ENV: NodeEnv;
    PORT: number;
  };

  database: {
    POSTGRES: TypeOrmModuleOptions;
  };

  auth: {
    ACCESS_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRATION: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRATION: string;
  };
}

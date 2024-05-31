import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { NodeEnv } from './common.enum';

export interface IConfig {
  core: {
    NODE_ENV: NodeEnv;
    PORT: number;
  };

  database: {
    MONGODB: TypeOrmModuleOptions;
  };

  auth: {
    ACCESS_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRATION: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRATION: string;
  };
}

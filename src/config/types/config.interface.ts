import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { NodeEnv } from './common.enum';

export interface IConfig {
  core: {
    NODE_ENV: NodeEnv;
    PORT: number;
  };

  database: {
    mongodb: TypeOrmModuleOptions;
  };
}

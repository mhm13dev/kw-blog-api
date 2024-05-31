import { IConfig } from '../types/config.interface';
import { NodeEnv } from '../types/common.enum';

export function getConfig(): IConfig {
  return {
    core: {
      NODE_ENV: (process.env.NODE_ENV ?? 'development') as NodeEnv,
      PORT: parseInt(process.env.PORT, 10) || 5001,
    },
    database: {
      mongodb: {
        type: 'mongodb',
        username: process.env.MONGO_INITDB_ROOT_USERNAME,
        password: process.env.MONGO_INITDB_ROOT_PASSWORD,
        host: process.env.MONGO_HOST,
        port: parseInt(process.env.MONGO_PORT, 10),
        database: process.env.MONGO_DATABASE,
        authSource: 'admin',
      },
    },
  };
}

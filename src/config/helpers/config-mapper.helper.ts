import { IConfig } from '../types/config.interface';
import { NodeEnv } from '../types/common.enum';

export function getConfig(): IConfig {
  return {
    core: {
      NODE_ENV: (process.env.NODE_ENV ?? 'development') as NodeEnv,
      PORT: parseInt(process.env.PORT, 10) || 5001,
    },
  };
}

import { Injectable } from '@nestjs/common';
import { getConfig } from './helpers/config-mapper.helper';
import { IConfig } from './types/config.interface';

@Injectable()
export class ConfigService {
  private config: IConfig;

  constructor() {
    this.config = getConfig();
  }

  get core(): IConfig['core'] {
    return this.config.core;
  }

  get database(): IConfig['database'] {
    return this.config.database;
  }
}

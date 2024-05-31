import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from './types/config.interface';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<IConfig>) {}

  get core(): IConfig['core'] {
    return this.configService.get('core', { infer: true })!;
  }

  get database(): IConfig['database'] {
    return this.configService.get('database', { infer: true })!;
  }

  get auth(): IConfig['auth'] {
    return this.configService.get('auth', { infer: true })!;
  }
}

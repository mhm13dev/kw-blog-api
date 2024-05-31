import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';
import { getConfig, validateConfig } from './helpers';

@Module({})
@Global()
export class AppConfigModule {
  static register(envFilePath: string = '.env'): DynamicModule {
    return {
      module: AppConfigModule,
      imports: [
        ConfigModule.forRoot({
          envFilePath: envFilePath,
          validate: validateConfig,
          load: [getConfig],
          isGlobal: false,
        }),
      ],
      providers: [AppConfigService],
      exports: [AppConfigService],
    };
  }
}

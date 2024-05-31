import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule as ConfigurationModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { validateConfig } from './helpers';

@Module({})
@Global()
export class ConfigModule {
  static register(envFilePath: string = '.env'): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        ConfigurationModule.forRoot({
          envFilePath: envFilePath,
          validate: validateConfig,
        }),
      ],
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}

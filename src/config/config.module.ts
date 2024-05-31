import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule as ConfigurationModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { validateConfig } from './helpers';

@Module({})
@Global()
export class ConfigModule {
  static register(nodeEnv: string): DynamicModule {
    if (!nodeEnv) {
      throw new Error(
        'ConfigModule: NODE_ENV is not set in package.json scripts!',
      );
    }

    const envFiles = [
      `.env.${nodeEnv}.local`,
      `.env.${nodeEnv}`,
      '.env.local',
      '.env',
    ];

    return {
      module: ConfigModule,
      imports: [
        ConfigurationModule.forRoot({
          envFilePath: envFiles,
          expandVariables: true,
          validate: validateConfig,
        }),
      ],
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}

import { NestFactory } from '@nestjs/core';
import { ConfigService } from './config/config.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  await app.listen(configService.core.PORT);
}
bootstrap();

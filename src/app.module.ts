import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.register(process.env.NODE_ENV)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

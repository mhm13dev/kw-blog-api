import { NestFactory } from '@nestjs/core';
import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/config.module';
import { AppConfigService } from 'src/config/config.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/user/entities';

@Injectable()
class SeederService {
  constructor(private readonly userService: UserService) {}

  async createAdmin() {
    console.log('Seed: Creating admin in database...');

    // Check if admin already exist
    if (await this.userService.doesAdminExist()) {
      console.log('Seed: Admin already exist');
      return;
    }

    await this.userService.create({
      email: 'admin@kwanso.com',
      password: '12345678',
      name: 'admin',
      role: UserRole.admin,
    });

    console.log('Seed: Admin created successfully');
  }
}

@Module({
  imports: [
    AppConfigModule.register(),
    TypeOrmModule.forRootAsync({
      useFactory: (appConfigService: AppConfigService) => {
        return appConfigService.database.MONGODB;
      },
      inject: [AppConfigService],
    }),
    UserModule,
  ],
  providers: [SeederService],
})
class SeederModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);

  const seederService = app.get(SeederService);

  await seederService.createAdmin();

  await app.close();
}

bootstrap();

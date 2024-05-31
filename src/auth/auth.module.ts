import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { UserSession } from './entities';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';

@Module({
  providers: [AuthResolver, AuthService],
  imports: [
    UserModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserSession]),
  ],
})
export class AuthModule {}

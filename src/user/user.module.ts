import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { User, UserSession } from './entities';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, UserSession]),
  ],
  providers: [
    UserResolver,
    UserService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [UserService],
})
export class UserModule {}

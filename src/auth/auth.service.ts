import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { instanceToPlain } from 'class-transformer';
import { User, UserRole } from 'src/user/entities';
import { UserService } from 'src/user/user.service';
import { ConfigService } from 'src/config/config.service';
import { TokenPayload, TokensPair } from './types/jwt.types';
import { UserSession } from './entities';
import { LoginUserInput, LoginUserResponse, RegisterUserInput } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
  ) {}

  async registerUser(registerUserInput: RegisterUserInput): Promise<User> {
    // Check if passwords match
    if (registerUserInput.password !== registerUserInput.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exist
    if (!!(await this.userService.findOneByEmail(registerUserInput.email))) {
      throw new ForbiddenException('Email already exist');
    }

    // Create User
    return this.userService.create({
      email: registerUserInput.email,
      password: registerUserInput.password,
      name: registerUserInput.email.split('@')[0],
      role: UserRole.user,
    });
  }

  async loginUser(loginUserInput: LoginUserInput): Promise<LoginUserResponse> {
    // Check if user exist
    const user = await this.userService.findOneByEmail(loginUserInput.email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Check if passwords match
    if (!(await user.comparePassword(loginUserInput.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokenPayload = new TokenPayload({
      sub: user._id.toHexString(),
      role: user.role,
      session_id: new ObjectId().toHexString(),
    });

    // Generate JWT Tokens
    const tokensPair = await this.generateTokensPair(tokenPayload);

    // Create User Session
    await this.createSession(tokenPayload, tokensPair.refresh_token);

    return new LoginUserResponse({
      user,
      access_token: tokensPair.access_token,
      refresh_token: tokensPair.refresh_token,
    });
  }

  private async generateTokensPair(payload: TokenPayload): Promise<TokensPair> {
    return new TokensPair({
      access_token: await this.jwtService.signAsync(instanceToPlain(payload), {
        secret: this.configService.auth.ACCESS_TOKEN_SECRET,
        expiresIn: this.configService.auth.ACCESS_TOKEN_EXPIRATION,
      }),
      refresh_token: await this.jwtService.signAsync(instanceToPlain(payload), {
        secret: this.configService.auth.REFRESH_TOKEN_SECRET,
        expiresIn: this.configService.auth.REFRESH_TOKEN_EXPIRATION,
      }),
    });
  }

  private async createSession(
    tokenPayload: TokenPayload,
    refreshToken: string,
  ): Promise<void> {
    const userSession = this.userSessionRepository.create({
      _id: new ObjectId(tokenPayload.session_id),
      user_id: new ObjectId(tokenPayload.sub),
      refresh_token: refreshToken,
    });
    await this.userSessionRepository.save(userSession);
  }
}

import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { v4 as uuidV4 } from 'uuid';
import { User, UserRole } from 'src/user/entities';
import { UserService } from 'src/user/user.service';
import { AppConfigService } from 'src/config/config.service';
import { TokenPayload, TokensPair } from './types/jwt.types';
import { UserSession } from './entities';
import {
  LoginUserInput,
  LoginUserResponse,
  RefreshTokensResponse,
  RegisterUserInput,
} from './dto';

/**
 * Service for operations related to `User` authentication
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
  ) {}

  /**
   * Creates a new `User` in the database.
   *
   * It first compares the `password` and `confirm_password`.
   * Then checks if the `User` with the same `email` does not exist in the database.
   * If not, it creates a new `User` in the database.
   * @param input - Input data for registering a new `User`
   * @returns Created `User` object from the database
   * @throws `BadRequestException` If the input data is invalid or passwords do not match
   * @throws `ForbiddenException` If the `User` with email already exists
   */
  async registerUser(input: RegisterUserInput): Promise<User> {
    // Check if passwords match
    if (input.password !== input.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exist
    if (!!(await this.userService.findOneByEmail(input.email))) {
      throw new ForbiddenException('Email already exist');
    }

    // Create User
    return this.userService.create({
      email: input.email,
      password: input.password,
      name: input.email.split('@')[0],
      role: UserRole.user,
    });
  }

  /**
   * Login a `User`.
   *
   * It first checks if the `User` with the `email` exists.
   * Then compares the input password with the hashed password in the database.
   * If everything is fine, it generates a new `access_token` and `refresh_token`.
   * It creates a new `UserSession` in the database.
   * The `session_id` is stored in the `access_token` and `refresh_token` payload.
   * The `refresh_token` is hashed and stored in the `UserSession`.
   * @param input - Input data for logging in a `User`
   * @returns `access_token`, `refresh_token` and `User` object
   * @throws `BadRequestException` If the `email` or `password` are invalid
   */
  async loginUser(input: LoginUserInput): Promise<LoginUserResponse> {
    // Check if user exist
    const user = await this.userService.findOneByEmail(input.email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Check if passwords match
    if (!(await user.comparePassword(input.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate JWT Tokens
    const tokenPayload = new TokenPayload({
      sub: user.id,
      role: user.role,
      session_id: uuidV4(),
    });
    const tokensPair = await this.generateTokensPair(tokenPayload);

    // Create User Session
    await this.createSession(user, tokenPayload, tokensPair.refresh_token);

    return new LoginUserResponse({
      user,
      access_token: tokensPair.access_token,
      refresh_token: tokensPair.refresh_token,
    });
  }

  /**
   * Refresh the `access_token` and `refresh_token`.
   *
   * It first checks if the `UserSession` exists.
   * Then compares `refreshToken` with the hashed `refresh_token` from the database.
   * If everything is fine, it generates a new `access_token` and `refresh_token`.
   * It updates the `refresh_token` stored in the `UserSession`.
   *
   * It employs `token rotation` and `automatic reuse detection`.
   *
   * {@link https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/ | Refresh Tokens with Automatic Reuse Detection}.
   *
   * @param currentUserPayload - Logged in `User` payload
   * @param refreshToken - Refresh token from the authorization header
   * @returns `access_token` and `refresh_token`
   * @throws `UnauthorizedException("Invalid session")` If the `UserSession` is not found i.e. `User` is logged out
   * @throws `UnauthorizedException("Compromised refresh token")` If an old `refreshToken` of the same `UserSession` is used
   */
  async refreshTokens(
    currentUserPayload: TokenPayload,
    refreshToken: string,
  ): Promise<RefreshTokensResponse> {
    // Check if session exist
    const userSession = await this.userSessionRepository.findOneBy({
      id: currentUserPayload.session_id,
    });

    if (!userSession) {
      throw new UnauthorizedException('Invalid session');
    }

    // Check if refresh token match
    if (!(await userSession.compareRefreshToken(refreshToken))) {
      // If doesn't match, delete session because someone is using an old `refreshToken` of the current session. The `refreshToken` is compromised.
      await this.userSessionRepository.remove(userSession);
      throw new UnauthorizedException('Compromised refresh token');
    }

    // Generate JWT Tokens
    const tokenPayload = new TokenPayload({
      sub: currentUserPayload.sub,
      role: currentUserPayload.role,
      session_id: currentUserPayload.session_id,
    });
    const tokensPair = await this.generateTokensPair(tokenPayload);

    // Update User Session
    userSession.refresh_token = tokensPair.refresh_token;
    await this.userSessionRepository.save(userSession);

    return new RefreshTokensResponse({
      access_token: tokensPair.access_token,
      refresh_token: tokensPair.refresh_token,
    });
  }

  /**
   * Logout a `User`.
   *
   * It deletes the `UserSession` from the database.
   * @param currentUserPayload - Logged in `User` payload
   * @returns `true` if the `UserSession` is deleted successfully
   */
  async logout(currentUserPayload: TokenPayload): Promise<boolean> {
    // Delete User Session
    const session = await this.userSessionRepository.findOneBy({
      id: currentUserPayload.session_id,
    });
    if (!session) {
      return true;
    }
    await this.userSessionRepository.remove(session);
    return true;
  }

  /**
   * Generates a new `access_token` and `refresh_token`.
   *
   * It uses separete `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` to sign the tokens.
   * The `access_token` has expiration time of `15 minutes` and `refresh_token` has expiration time of `7 days`.
   * The expiration time and secrets can be configured in the `.env` file.
   * @param payload - Payload to be stored in the `access_token` and `refresh_token`
   * @returns `access_token` and `refresh_token`
   */
  private async generateTokensPair(payload: TokenPayload): Promise<TokensPair> {
    return new TokensPair({
      access_token: await this.jwtService.signAsync(instanceToPlain(payload), {
        secret: this.appConfigService.auth.ACCESS_TOKEN_SECRET,
        expiresIn: this.appConfigService.auth.ACCESS_TOKEN_EXPIRATION,
      }),
      refresh_token: await this.jwtService.signAsync(instanceToPlain(payload), {
        secret: this.appConfigService.auth.REFRESH_TOKEN_SECRET,
        expiresIn: this.appConfigService.auth.REFRESH_TOKEN_EXPIRATION,
      }),
    });
  }

  /**
   * Creates a new `UserSession` in the database.
   * @param tokenPayload - Payload of the `access_token` and `refresh_token`
   * @param refreshToken - Refresh token to be stored in the `UserSession`
   * @returns `void`
   */
  private async createSession(
    user: User,
    tokenPayload: TokenPayload,
    refreshToken: string,
  ): Promise<void> {
    const userSession = this.userSessionRepository.create({
      id: tokenPayload.session_id,
      user,
      refresh_token: refreshToken,
    });
    await this.userSessionRepository.save(userSession);
  }
}

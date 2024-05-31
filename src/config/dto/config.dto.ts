import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { NodeEnv } from '../types/common.enum';

/**
 * This DTO class is used to validate the environment variables. If the environment variables are not valid, the application will not start.
 */
export class ConfigDto {
  // Core
  @IsNotEmpty()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @IsNotEmpty()
  @IsNumber()
  PORT: number;

  // Database
  @IsNotEmpty()
  @IsString()
  MONGO_INITDB_ROOT_USERNAME: string;

  @IsNotEmpty()
  @IsString()
  MONGO_INITDB_ROOT_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  MONGO_HOST: string;

  @IsNotEmpty()
  @IsNumber()
  MONGO_PORT: number;

  @IsNotEmpty()
  @IsString()
  MONGO_DATABASE: string;

  // AUTH
  @IsNotEmpty()
  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsNotEmpty()
  @IsString()
  ACCESS_TOKEN_EXPIRATION: string;

  @IsNotEmpty()
  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsNotEmpty()
  @IsString()
  REFRESH_TOKEN_EXPIRATION: string;
}

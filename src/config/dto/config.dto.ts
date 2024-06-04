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
  POSTGRES_USER: string;

  @IsNotEmpty()
  @IsString()
  POSTGRES_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  POSTGRES_DB: string;

  @IsNotEmpty()
  @IsString()
  POSTGRES_HOST: string;

  @IsNotEmpty()
  @IsNumber()
  POSTGRES_PORT: number;

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

  // Elastic Search
  @IsNotEmpty()
  @IsString()
  ELASTIC_SEARCH_HOST: string;

  @IsNotEmpty()
  @IsNumber()
  ELASTIC_SEARCH_PORT: number;

  @IsNotEmpty()
  @IsString()
  ELASTIC_USER_NAME: string;

  @IsNotEmpty()
  @IsString()
  ELASTIC_USER_PASSWORD: string;
}

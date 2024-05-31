import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { NodeEnv } from '../types/common.enum';

export class ConfigDto {
  // Core
  @IsNotEmpty()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @IsNotEmpty()
  @IsNumber()
  PORT: number;
}

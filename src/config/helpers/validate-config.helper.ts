import { InternalServerErrorException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ConfigDto } from '../dto';

/**
 * This function validates the environment variables and casts them to the appropriate types using the `class-transformer`, `class-validator` packages and `ConfigDto`.
 *
 * If the environment variables are not valid, it throws an `InternalServerErrorException`.
 */
export function validateConfig(processEnv: NodeJS.Dict<string>): ConfigDto {
  const validatedAndCastedEnv = plainToClass(ConfigDto, processEnv, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedAndCastedEnv, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new InternalServerErrorException(errors.toString());
  }
  return validatedAndCastedEnv;
}

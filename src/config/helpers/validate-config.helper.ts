import { InternalServerErrorException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ConfigDto } from '../dto';

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

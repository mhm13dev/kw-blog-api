import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export function IsMongoObjectId(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isMongoObjectId',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} must be a valid MongoDB ObjectId`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return ObjectId.isValid(value);
        },
      },
    });
  };
}

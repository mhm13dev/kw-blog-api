import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { ObjectId } from 'mongodb';

/**
 * This custom validator checks if the input value is a valid MongoDB `ObjectId`.
 *
 * We already have `IsMongoId` decorator in `class-validator` but
 * it could not validate the instance of MongoDB `ObjectId` (transformed via `ToMongoObjectId` custom transformer).
 * That's why we created a custom validator.
 */
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

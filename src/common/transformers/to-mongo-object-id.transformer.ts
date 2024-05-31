import { Transform } from 'class-transformer';
import { isMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

/**
 * This custom tranformenr checks if the input is MongoDB Object ID in string format.
 * If yes, it converts it from string to `ObjectId` instance. Otherwise, it returns the input value without modifications.
 */
export function ToMongoObjectId() {
  return Transform(({ value }) => {
    if (!isMongoId(value)) {
      return value;
    }
    return new ObjectId(value);
  });
}

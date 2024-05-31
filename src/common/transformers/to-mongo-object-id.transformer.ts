import { Transform } from 'class-transformer';
import { isMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

export function ToMongoObjectId() {
  return Transform(({ value }) => {
    if (!isMongoId(value)) {
      return value;
    }
    return new ObjectId(value);
  });
}

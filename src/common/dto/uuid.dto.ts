import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class UUIDDTO {
  @Field()
  @IsUUID()
  id: string;
}

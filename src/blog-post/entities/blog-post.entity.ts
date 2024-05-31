import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Transform } from 'class-transformer';
import { MaxLength } from 'class-validator';

@ObjectType()
@Entity({
  name: 'blog_posts',
})
export class BlogPost {
  @Field(() => ID)
  @ObjectIdColumn()
  _id: ObjectId;

  @Field(() => String)
  @Column()
  author_id: ObjectId;

  @Field(() => String)
  @Column()
  @Transform(({ value }) => value?.toString().trim())
  @MaxLength(100)
  title: string;

  @Field(() => String)
  @Column()
  @Transform(({ value }) => value?.toString().trim())
  @MaxLength(1000)
  content: string;

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

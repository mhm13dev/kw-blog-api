import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { User } from 'src/user/entities';
import { BlogPost } from 'src/blog-post/entities';
import { IsMongoObjectId } from 'src/common/validators';
import { ToMongoObjectId } from 'src/common/transformers';

@ObjectType()
@Entity({
  name: 'post_comments',
})
export class PostComment {
  @Field(() => ID)
  @ObjectIdColumn()
  _id: ObjectId;

  @Field(() => String)
  @Column()
  author_id: ObjectId;

  @Field(() => User)
  author: User;

  @Field(() => String)
  @Column()
  @IsMongoObjectId()
  @ToMongoObjectId()
  post_id: ObjectId;

  @Field(() => BlogPost)
  post: BlogPost;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsMongoObjectId()
  @ToMongoObjectId()
  reply_to_comment_id?: ObjectId;

  @Field(() => PostComment, { nullable: true })
  reply_to_comment?: PostComment;

  @Field(() => String)
  @Column()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toString()?.trim())
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

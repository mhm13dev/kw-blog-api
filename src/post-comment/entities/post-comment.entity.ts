import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { User } from 'src/user/entities';
import { BlogPost } from 'src/blog-post/entities';

/**
 * `PostComment` entity for the Database and GraphQL Schema
 */
@ObjectType()
@Entity({
  name: 'post_comments',
})
export class PostComment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  author_id: string;

  @Field(() => User)
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author_id' })
  author: User;

  /**
   * This field is used to reference the `BlogPost` that this comment (nested or top-level) belongs to.
   */
  @Field(() => String)
  @Column()
  @IsUUID()
  post_id: string;

  @Field(() => BlogPost)
  @ManyToOne(() => BlogPost, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: BlogPost;

  /**
   * This field is used to enable support for nested comments.
   * If this field is not `null`, then this comment is a reply to another comment.
   * If this field is `null`, then this comment is a top-level comment to a `BlogPost`.
   */
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsUUID()
  parent_comment_id?: string;

  @Field(() => PostComment, { nullable: true })
  @ManyToOne(() => PostComment, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_comment_id' })
  parent_comment?: PostComment;

  @Field(() => String)
  @Column('text')
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toString()?.trim())
  content: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}

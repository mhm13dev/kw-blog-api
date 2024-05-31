import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { User } from 'src/user/entities';

/**
 * `BlogPost` entity for the Database and GraphQL Schema
 */
@ObjectType()
@Entity({
  name: 'blog_posts',
})
export class BlogPost {
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

  @Field(() => String)
  @Column()
  @Transform(({ value }) => value?.toString().trim())
  @MaxLength(100)
  title: string;

  @Field(() => String)
  @Column('text')
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toString().trim())
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

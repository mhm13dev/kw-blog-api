import {
  Column,
  Entity,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import * as argon2 from 'argon2';

/**
 * `UserSession` entity for the Database
 */
@Entity({
  name: 'user_sessions',
})
export class UserSession {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  user_id: ObjectId;

  @Column()
  refresh_token: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  /**
   * Hashes the `refresh_token` before inserting or updating the `UserSession`.
   *
   * Uses the {@link https://www.npmjs.com/package/argon2 | argon2} library to hash the `refresh_token`
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashRefreshToken() {
    if (this.refresh_token) {
      this.refresh_token = await argon2.hash(this.refresh_token);
    }
  }

  compareRefreshToken(attemptedRefreshToken: string): Promise<boolean> {
    return argon2.verify(this.refresh_token, attemptedRefreshToken);
  }
}

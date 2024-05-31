import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import * as argon2 from 'argon2';
import { User } from 'src/user/entities';

/**
 * `UserSession` entity for the Database
 */
@Entity({
  name: 'user_sessions',
})
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @Column()
  refresh_token: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

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

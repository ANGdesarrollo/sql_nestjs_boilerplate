import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { UserEntity } from './UserSchema';

@Entity('password_recovery_tokens')
export class PasswordRecoveryTokenEntity
{
  @PrimaryGeneratedColumn('increment')
    id: number;

  @Column()
    token: string;

  @Column({ name: 'user_id', type: 'int' })
    userId: number;

  @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

  @Column({ name: 'is_used', default: false })
    isUsed: boolean;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

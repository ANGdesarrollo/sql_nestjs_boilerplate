import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

import { UserEntity } from './UserSchema';

@Entity('password_recovery_tokens')
export class PasswordRecoveryTokenEntity
{
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column()
    token: string;

  @Column({ name: 'user_id' })
    userId: string;

  @Column({ name: 'expires_at' })
    expiresAt: Date;

  @Column({ name: 'is_used', default: false })
    isUsed: boolean;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
    user: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

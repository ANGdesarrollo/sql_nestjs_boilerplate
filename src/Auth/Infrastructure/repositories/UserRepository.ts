// src/Auth/Infrastructure/UserRepository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RegisterUserPayload } from '../../Domain/Payloads/RegisterUserPayload';
import { UserEntity } from '../schemas/UserSchema';

@Injectable()
export class UserRepository
{
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<UserEntity>
  ) {}

  async findByUsername(username: string): Promise<UserEntity | null>
  {
    return this.userRepository.findOne({ where: { username } });
  }

  async create(userData: RegisterUserPayload): Promise<UserEntity>
  {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<UserEntity>): Promise<UserEntity | null>
  {
    await this.userRepository.update(id, userData);
    return this.userRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void>
  {
    await this.userRepository.delete(id);
  }
}

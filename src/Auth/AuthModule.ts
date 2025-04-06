import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DataSource } from 'typeorm';

import { EnvService } from '../Config/Env/EnvService';

import { AuthUseCases } from './Application';
import { HashService } from './Domain/Services/HashService';
import { JwtStrategy } from './Domain/Strategies/JwtStrategy';
import { UserRepository } from './Infrastructure/repositories/UserRepository';
import { UserEntity } from './Infrastructure/schemas/UserSchema';
import { AuthControllers } from './Presentation/Controllers';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.jwt.secret,
        signOptions: { expiresIn: envService.jwt.expiresIn }
      })
    })
  ],
  controllers: [...AuthControllers],
  providers: [
    ...AuthUseCases,
    UserRepository,
    JwtStrategy,
    HashService,
    {
      provide: 'USER_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(UserEntity),
      inject: ['DATA_SOURCE']
    }
  ]
})
export class AuthModule {}

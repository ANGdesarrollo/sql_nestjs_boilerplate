import { CreateUserUseCase } from './CreateUserUseCase';
import { LoginUserUseCase } from './LoginUserUseCase';
import { SyncRolesUseCase } from './SyncRolesUseCase';
import { UpdateUserUseCase } from './UpdateUserUseCase';

export const AuthUseCases = [
  LoginUserUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  SyncRolesUseCase
];

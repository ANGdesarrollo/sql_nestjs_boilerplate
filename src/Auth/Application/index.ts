import { LoginUserUseCase } from './LoginUserUseCase';
import { CreateUserUseCase } from './CreateUserUseCase';
import { SyncRolesUseCase } from './SyncRolesUseCase';
import { UpdateUserUseCase } from './UpdateUserUseCase';

export const AuthUseCases = [
  LoginUserUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  SyncRolesUseCase
];

import { LoginUserUseCase } from './LoginUserUseCase';
import { RegisterUserUseCase } from './RegisterUserUseCase';
import { SyncRolesUseCase } from './SyncRolesUseCase';
import { UpdateUserUseCase } from './UpdateUserUseCase';

export const AuthUseCases = [
  LoginUserUseCase,
  RegisterUserUseCase,
  UpdateUserUseCase,
  SyncRolesUseCase
];

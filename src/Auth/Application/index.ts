import { AssignUserToTenantUseCase } from './AssignUserToTenantUseCase';
import { CreateSuperUserUseCase } from './CreateSuperUserUseCase';
import { CreateTenantUseCase } from './CreateTenantUseCase';
import { CreateUserUseCase } from './CreateUserUseCase';
import { LoginUserUseCase } from './LoginUserUseCase';
import { SetDefaultTenantUseCase } from './SetDefaultTenantUseCase';
import { SyncRolesUseCase } from './SyncRolesUseCase';
import { UpdateUserUseCase } from './UpdateUserUseCase';

export const AuthUseCases = [
  LoginUserUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  SyncRolesUseCase,
  CreateSuperUserUseCase,
  CreateTenantUseCase,
  AssignUserToTenantUseCase,
  SetDefaultTenantUseCase
];

import { AssignUserToTenantUseCase } from './AssignUserToTenantUseCase';
import { CreateSuperUserUseCase } from './CreateSuperUserUseCase';
import { CreateTenantUseCase } from './CreateTenantUseCase';
import { CreateUserUseCase } from './CreateUserUseCase';
import { GetMeUseCase } from './GetMeUseCase';
import { GetUserUseCase } from './GetUserUseCase';
import { LoginUserUseCase } from './LoginUserUseCase';
import { SetDefaultTenantUseCase } from './SetDefaultTenantUseCase';
import { SwitchTenantUseCase } from './SwitchTenantUseCase';
import { SyncRolesUseCase } from './SyncRolesUseCase';
import { UpdateTenantUseCase } from './UpdateTenantUseCase';
import { UpdateUserUseCase } from './UpdateUserUseCase';

export const AuthUseCases = [
  LoginUserUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  SyncRolesUseCase,
  CreateSuperUserUseCase,
  CreateTenantUseCase,
  AssignUserToTenantUseCase,
  SetDefaultTenantUseCase,
  GetUserUseCase,
  GetMeUseCase,
  SwitchTenantUseCase,
  UpdateTenantUseCase
];

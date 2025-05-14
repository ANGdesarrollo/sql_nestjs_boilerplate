import { AssignUserToTenantUseCase } from './AssignUserToTenantUseCase';
import { CreateSuperUserUseCase } from './CreateSuperUserUseCase';
import { CreateTenantUseCase } from './CreateTenantUseCase';
import { CreateUserUseCase } from './CreateUserUseCase';
import { GetMeUseCase } from './GetMeUseCase';
import { GetUserUseCase } from './GetUserUseCase';
import { ListUsersUseCase } from './ListUsersUseCase';
import { LoginUserUseCase } from './LoginUserUseCase';
import { RequestPasswordRecoveryUseCase } from './RequestPasswordRecoveryUseCase';
import { ResetPasswordUseCase } from './ResetPasswordUseCase';
import { SwitchTenantUseCase } from './SwitchTenantUseCase';
import { SyncRolesUseCase } from './SyncRolesUseCase';
import { UpdateTenantUseCase } from './UpdateTenantUseCase';
import { UpdateUserUseCase } from './UpdateUserUseCase';
import { ListTenantsUseCase } from './ListTenantsUseCase';

export const AuthUseCases = [
  LoginUserUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  SyncRolesUseCase,
  CreateSuperUserUseCase,
  CreateTenantUseCase,
  AssignUserToTenantUseCase,
  GetUserUseCase,
  GetMeUseCase,
  SwitchTenantUseCase,
  UpdateTenantUseCase,
  RequestPasswordRecoveryUseCase,
  ResetPasswordUseCase,
  ListUsersUseCase,
  ListTenantsUseCase
];

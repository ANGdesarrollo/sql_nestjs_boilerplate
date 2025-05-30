import { faker } from '@faker-js/faker';

import { CreateUserPayload } from '../../../src/Auth/Domain/Payloads/CreateUserPayload';

export const CreateUserFixture = (payload: {  tenantIds: number[], defaultTenantId: number }): CreateUserPayload =>
{
  return {
    username: faker.internet.email(),
    password: faker.internet.password(),
    defaultTenantId: payload.defaultTenantId,
    tenantIds: payload.tenantIds
  };
};

import { faker } from '@faker-js/faker';

import { CreateTenantPayload } from '../../../src/Auth/Domain/Payloads/CreateTenantPayload';

export  const createTenantFixture = (): CreateTenantPayload =>
{
  const tenantName = faker.company.name();
  return {
    name: tenantName,
    description: faker.company.catchPhrase()
  };
};

import { faker } from '@faker-js/faker';

import { TenantPayload } from '../../../src/Auth/Domain/Payloads/TenantPayload';

export  const createTenantFixture = (): TenantPayload => ({
  name: faker.company.name(),
  description: faker.company.catchPhrase(),
  slug: faker.helpers.slugify(faker.company.name().toLowerCase())
});

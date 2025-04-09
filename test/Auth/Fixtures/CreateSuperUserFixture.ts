import { faker } from '@faker-js/faker';

export const CreateSuperUserFixture = (): any =>
{
  return {
    username: faker.internet.email(),
    password: faker.internet.password(),
    tenantName: faker.internet.domainName(),
    tenantSlug: faker.internet.domainName()
  };
};

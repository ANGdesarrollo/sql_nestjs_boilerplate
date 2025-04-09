import { faker } from '@faker-js/faker';

export interface SuperUserFixture
{
  username: string;
  password: string;
  tenantName: string;
  tenantSlug: string;
}

export const CreateSuperUserFixture = (): SuperUserFixture =>
{
  return {
    username: faker.internet.email(),
    password: faker.internet.password(),
    tenantName: faker.internet.domainName(),
    tenantSlug: faker.internet.domainName()
  };
};

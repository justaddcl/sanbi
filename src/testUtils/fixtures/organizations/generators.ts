import { faker } from "@faker-js/faker";

export const createOrganizationName = () => faker.company.name();

export const createOrganizationSlug = (name?: string) =>
  faker.helpers.slugify(name ?? createOrganizationName()).toLowerCase();

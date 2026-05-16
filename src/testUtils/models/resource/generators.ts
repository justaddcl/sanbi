import { faker } from "@faker-js/faker";

export const createResourceName = () => faker.word.words({ count: 3 });

export const createResourceUrl = () => {
  const path = faker.helpers
    .slugify(faker.word.words({ count: 2 }))
    .toLowerCase();

  return `https://${faker.internet.domainName()}/${path}`;
};

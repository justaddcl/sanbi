import { faker } from "@faker-js/faker";

export const createEventTypeName = () =>
  `${faker.word.adjective()} ${faker.word.noun()}`;

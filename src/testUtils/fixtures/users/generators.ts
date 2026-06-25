import { faker } from "@faker-js/faker";

export const createUserId = () =>
  `user_${faker.string.alphanumeric({ length: 24 })}`;

export const createUserEmail = () => faker.internet.email();

export const createUserFirstName = () => faker.person.firstName();

export const createUserLastName = () => faker.person.lastName();

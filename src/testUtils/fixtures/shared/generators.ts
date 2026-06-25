import { faker } from "@faker-js/faker";

export const createFixtureDate = () =>
  faker.date.future().toISOString().slice(0, 10);

export const createFixtureTimestamp = () => faker.date.past({ years: 1 });

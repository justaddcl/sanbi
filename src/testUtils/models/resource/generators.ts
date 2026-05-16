import { faker } from "@faker-js/faker";

export const createResourceName = () => faker.word.words({ count: 3 });

export const createResourceUrl = () => faker.internet.url();

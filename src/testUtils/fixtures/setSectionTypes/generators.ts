import { faker } from "@faker-js/faker";

export const createSetSectionTypeName = () =>
  faker.helpers.arrayElement(["Full band", "Prayer", "Communion"]);

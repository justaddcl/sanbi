import {
  createTableRelationsHelpers,
  extractTablesRelationalConfig,
  normalizeRelation,
} from "drizzle-orm/relations";

import * as schema from "@server/db/schema";

describe("database schema relations", () => {
  it("infers the nullable users.preferences relation from userPreferences.userId", () => {
    const relationalConfig = extractTablesRelationalConfig(
      schema,
      createTableRelationsHelpers,
    );
    const usersTable = relationalConfig.tables.users;
    const preferencesRelation = usersTable?.relations.preferences;

    expect(usersTable).toBeDefined();
    expect(preferencesRelation).toBeDefined();

    const normalizedRelation = normalizeRelation(
      relationalConfig.tables,
      relationalConfig.tableNamesMap,
      preferencesRelation!,
    );

    expect(normalizedRelation.fields.map((column) => column.name)).toEqual([
      "id",
    ]);
    expect(normalizedRelation.references.map((column) => column.name)).toEqual([
      "user_id",
    ]);
  });
});

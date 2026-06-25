import { resolveDatabaseUrl } from "@server/db/resolveDatabaseUrl";

describe("resolveDatabaseUrl", () => {
  const localDatabaseUrl =
    "postgresql://postgres:password@localhost:5432/sanbi";
  const e2eDatabaseUrl =
    "postgresql://postgres:password@localhost:5432/sanbi_e2e";
  const previewDatabaseUrl =
    "postgresql://preview:password@preview.example.com:5432/sanbi_preview";
  const productionDatabaseUrl =
    "postgresql://production:password@production.example.com:5432/sanbi";

  it("uses DATABASE_URL for local development", () => {
    const result = resolveDatabaseUrl({
      DATABASE_URL: localDatabaseUrl,
      NODE_ENV: "development",
    });

    expect(result).toBe(localDatabaseUrl);
  });

  it("uses DATABASE_URL for E2E even when production env vars are present", () => {
    const result = resolveDatabaseUrl({
      DATABASE_URL: e2eDatabaseUrl,
      POSTGRES_URL: productionDatabaseUrl,
      SANBI_E2E: "1",
      VERCEL_ENV: "production",
    });

    expect(result).toBe(e2eDatabaseUrl);
  });

  it("uses DATABASE_URL for Vercel Preview", () => {
    const result = resolveDatabaseUrl({
      DATABASE_URL: previewDatabaseUrl,
      POSTGRES_URL: productionDatabaseUrl,
      VERCEL_ENV: "preview",
    });

    expect(result).toBe(previewDatabaseUrl);
  });

  it("uses DATABASE_URL when SANBI_APP_ENV explicitly selects preview", () => {
    const result = resolveDatabaseUrl({
      DATABASE_URL: previewDatabaseUrl,
      POSTGRES_URL: productionDatabaseUrl,
      SANBI_APP_ENV: "preview",
      VERCEL_ENV: "production",
    });

    expect(result).toBe(previewDatabaseUrl);
  });

  it("uses POSTGRES_URL for Vercel Production", () => {
    const result = resolveDatabaseUrl({
      DATABASE_URL: previewDatabaseUrl,
      POSTGRES_URL: productionDatabaseUrl,
      VERCEL_ENV: "production",
    });

    expect(result).toBe(productionDatabaseUrl);
  });

  it("uses POSTGRES_URL when SANBI_APP_ENV explicitly selects production", () => {
    const result = resolveDatabaseUrl({
      DATABASE_URL: previewDatabaseUrl,
      POSTGRES_URL: productionDatabaseUrl,
      SANBI_APP_ENV: "production",
      VERCEL_ENV: "preview",
    });

    expect(result).toBe(productionDatabaseUrl);
  });

  it("fails clearly when preview DATABASE_URL matches POSTGRES_URL", () => {
    expect(() =>
      resolveDatabaseUrl({
        DATABASE_URL: productionDatabaseUrl,
        POSTGRES_URL: productionDatabaseUrl,
        VERCEL_ENV: "preview",
      }),
    ).toThrow(
      "Preview database misconfiguration: DATABASE_URL must point at the dedicated preview database and must not match POSTGRES_URL.",
    );
  });

  it("fails clearly when preview DATABASE_URL is missing", () => {
    expect(() =>
      resolveDatabaseUrl({
        POSTGRES_URL: productionDatabaseUrl,
        VERCEL_ENV: "preview",
      }),
    ).toThrow("DATABASE_URL is required for the preview database connection.");
  });

  it("fails clearly when the selected database URL is missing", () => {
    expect(() =>
      resolveDatabaseUrl({
        DATABASE_URL: previewDatabaseUrl,
        VERCEL_ENV: "production",
      }),
    ).toThrow("POSTGRES_URL is required for the production database connection.");
  });
});

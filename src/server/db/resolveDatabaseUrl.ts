type DatabaseUrlEnv = {
  DATABASE_URL?: string;
  NODE_ENV?: string;
  POSTGRES_URL?: string;
  SANBI_APP_ENV?: string;
  SANBI_E2E?: string;
  VERCEL_ENV?: string;
};

type DatabaseRuntimeEnvironment = "e2e" | "local" | "preview" | "production";

const resolveDatabaseRuntimeEnvironment = (
  env: DatabaseUrlEnv,
): DatabaseRuntimeEnvironment => {
  if (env.SANBI_E2E === "1") {
    return "e2e";
  }

  // SANBI_APP_ENV is for local scripts and non-Vercel overrides; VERCEL_ENV is set by Vercel deployments.
  if (env.SANBI_APP_ENV === "preview" || env.SANBI_APP_ENV === "production") {
    return env.SANBI_APP_ENV;
  }

  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "production") {
    return env.VERCEL_ENV;
  }

  return "local";
};

const getRequiredDatabaseUrl = (
  env: DatabaseUrlEnv,
  key: "DATABASE_URL" | "POSTGRES_URL",
  runtimeEnvironment: DatabaseRuntimeEnvironment,
) => {
  const databaseUrl = env[key];

  if (!databaseUrl) {
    throw new Error(
      `${key} is required for the ${runtimeEnvironment} database connection.`,
    );
  }

  return databaseUrl;
};

export const resolveDatabaseUrl = (env: DatabaseUrlEnv) => {
  const runtimeEnvironment = resolveDatabaseRuntimeEnvironment(env);

  if (runtimeEnvironment === "production") {
    return getRequiredDatabaseUrl(env, "POSTGRES_URL", runtimeEnvironment);
  }

  const databaseUrl = getRequiredDatabaseUrl(
    env,
    "DATABASE_URL",
    runtimeEnvironment,
  );

  if (
    runtimeEnvironment === "preview" &&
    env.POSTGRES_URL &&
    databaseUrl === env.POSTGRES_URL
  ) {
    throw new Error(
      "Preview database misconfiguration: DATABASE_URL must point at the dedicated preview database and must not match POSTGRES_URL.",
    );
  }

  return databaseUrl;
};

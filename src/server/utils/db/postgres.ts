export const POSTGRES_UNIQUE_CONSTRAINT_VIOLATION_CODE = "23505";

export const isUniqueConstraintViolation = (error: unknown) =>
  error instanceof Error &&
  "code" in error &&
  error.code === POSTGRES_UNIQUE_CONSTRAINT_VIOLATION_CODE;

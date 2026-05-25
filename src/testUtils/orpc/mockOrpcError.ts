/**
 * Options for constructing a mock ORPC error in tests.
 */
type MockOrpcErrorOptions = {
  /** Custom error message. */
  message?: string;
  /** Underlying error cause. */
  cause?: unknown;
};

/**
 * Mock implementation of ORPCError for Jest tests.
 */
class MockOrpcError extends Error {
  public readonly code: string;

  constructor(code: string, opts: MockOrpcErrorOptions = {}) {
    super(opts.message ?? `Mock ORPCError with code ${code}`);
    this.name = "ORPCError";
    this.code = code;
    this.cause = opts.cause;
  }
}

/**
 * Mock module object for replacing ORPC error exports in Jest.
 */
export const mockOrpcErrorModule = {
  __esModule: true,
  ORPCError: MockOrpcError,
};

/**
 * Shape of the mock ORPC error module export.
 */
export type MockOrpcErrorModule = typeof mockOrpcErrorModule;

type MockOrpcErrorOptions = {
  message?: string;
  cause?: unknown;
};

class MockOrpcError extends Error {
  public readonly code: string;

  constructor(code: string, ...rest: [MockOrpcErrorOptions] | []) {
    const opts = rest[0] ?? {};
    super(opts.message ?? `Mock ORPCError with code ${code}`);
    this.name = "ORPCError";
    this.code = code;
    this.cause = opts.cause;
  }
}

export const mockOrpcErrorModule = {
  __esModule: true,
  ORPCError: MockOrpcError,
};

export type MockOrpcErrorModule = typeof mockOrpcErrorModule;

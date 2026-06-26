import type * as LoggerModule from "../logger";

type MockPinoLogger = {
  trace: jest.Mock;
  debug: jest.Mock;
  info: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
  fatal: jest.Mock;
  child: jest.Mock;
};

jest.mock("pino", () => {
  const mockPinoLogger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    child: jest.fn(),
  };

  mockPinoLogger.child.mockReturnValue(mockPinoLogger);

  return {
    __esModule: true,
    default: jest.fn(() => mockPinoLogger),
    mockPinoLogger,
  };
});

const { mockPinoLogger } = jest.requireMock<{
  mockPinoLogger: MockPinoLogger;
}>("pino");
const { logger } = jest.requireActual<typeof LoggerModule>("../logger");

describe("logger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPinoLogger.child.mockReturnValue(mockPinoLogger);
  });

  it("logs direct Error arguments with pino's err serializer key", () => {
    const error = new Error("request failed");

    logger.error(error);

    expect(mockPinoLogger.error).toHaveBeenCalledWith({ err: error });
  });

  it("normalizes structured error fields to pino's err serializer key", () => {
    const error = new Error("request failed");

    logger.error({ durationMs: 42, error }, "tRPC request failed");

    expect(mockPinoLogger.error).toHaveBeenCalledWith(
      { durationMs: 42, err: error },
      "tRPC request failed",
    );
  });

  it("normalizes structured error fields in message-first logs", () => {
    const error = new Error("metadata refresh failed");
    const mutationInput = {
      resourceId: "resource-id",
    };

    logger.error("could not refresh resource metadata", {
      error,
      mutationInput,
    });

    expect(mockPinoLogger.error).toHaveBeenCalledWith(
      { err: error, mutationInput },
      "could not refresh resource metadata",
    );
  });

  it("normalizes structured error fields on child loggers", () => {
    const error = new Error("procedure failed");
    const procedureLogger = logger.child({ route: "/resource/update" });

    procedureLogger.error({ error, route: "/resource/update" }, "failed");

    expect(mockPinoLogger.child).toHaveBeenCalledWith({
      route: "/resource/update",
    });
    expect(mockPinoLogger.error).toHaveBeenCalledWith(
      { err: error, route: "/resource/update" },
      "failed",
    );
  });
});

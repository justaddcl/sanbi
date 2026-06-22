import { verifyWebhook } from "@clerk/nextjs/webhooks";

import {
  ClerkUserSyncError,
  markSanbiUserAuthDeleted,
  syncSanbiUserFromClerkUser,
} from "@server/auth/clerkUserSync";
import { db } from "@/server/db";

import { POST } from "../route";

jest.mock("@clerk/nextjs/webhooks", () => ({
  verifyWebhook: jest.fn(),
}));

jest.mock("@/server/db", () => ({
  db: { connection: "mock" },
}));

jest.mock("@server/auth/clerkUserSync", () => {
  class MockClerkUserSyncError extends Error {
    constructor(
      message: string,
      public readonly code: "MISSING_PRIMARY_EMAIL",
    ) {
      super(message);
      this.name = "ClerkUserSyncError";
    }
  }

  return {
    ClerkUserSyncError: MockClerkUserSyncError,
    markSanbiUserAuthDeleted: jest.fn(),
    syncSanbiUserFromClerkUser: jest.fn(),
  };
});

const createWebhookRequest = () => ({}) as never;

describe("Clerk webhook route", () => {
  const originalResponse = globalThis.Response;

  beforeAll(() => {
    Object.defineProperty(globalThis, "Response", {
      configurable: true,
      value: class {
        status: number;

        constructor(_body?: BodyInit | null, init?: ResponseInit) {
          this.status = init?.status ?? 200;
        }
      },
    });
  });

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(globalThis, "Response", {
      configurable: true,
      value: originalResponse,
    });
  });

  it("rejects requests that fail Clerk webhook verification", async () => {
    (verifyWebhook as jest.Mock).mockRejectedValue(new Error("invalid"));

    const response = await POST(createWebhookRequest());

    expect(response.status).toBe(400);
    expect(syncSanbiUserFromClerkUser).not.toHaveBeenCalled();
    expect(markSanbiUserAuthDeleted).not.toHaveBeenCalled();
  });

  it.each(["user.created", "user.updated"])(
    "syncs Sanbi users for %s",
    async (eventType) => {
      const clerkUser = {
        id: "user_123",
        email_addresses: [{ email_address: "ada@example.com" }],
      };
      (verifyWebhook as jest.Mock).mockResolvedValue({
        type: eventType,
        data: clerkUser,
      });

      const response = await POST(createWebhookRequest());

      expect(response.status).toBe(200);
      expect(syncSanbiUserFromClerkUser).toHaveBeenCalledWith({
        database: db,
        clerkUser,
      });
    },
  );

  it("marks Sanbi users as auth-deleted for user.deleted", async () => {
    (verifyWebhook as jest.Mock).mockResolvedValue({
      type: "user.deleted",
      data: { id: "user_123" },
    });

    const response = await POST(createWebhookRequest());

    expect(response.status).toBe(200);
    expect(markSanbiUserAuthDeleted).toHaveBeenCalledWith({
      database: db,
      userId: "user_123",
    });
  });

  it("logs user.deleted events that are missing a Clerk user id", async () => {
    (verifyWebhook as jest.Mock).mockResolvedValue({
      type: "user.deleted",
      data: {},
    });

    const response = await POST(createWebhookRequest());

    expect(response.status).toBe(200);
    expect(markSanbiUserAuthDeleted).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      "Clerk user.deleted webhook missing user id",
      {
        eventType: "user.deleted",
      },
    );
  });

  it("returns 422 when a Clerk user payload cannot be synced", async () => {
    (verifyWebhook as jest.Mock).mockResolvedValue({
      type: "user.created",
      data: { id: "user_123" },
    });
    (syncSanbiUserFromClerkUser as jest.Mock).mockRejectedValue(
      new ClerkUserSyncError("missing email", "MISSING_PRIMARY_EMAIL"),
    );

    const response = await POST(createWebhookRequest());

    expect(response.status).toBe(422);
  });

  it("acknowledges unsupported events without syncing", async () => {
    (verifyWebhook as jest.Mock).mockResolvedValue({
      type: "session.created",
      data: { id: "sess_123" },
    });

    const response = await POST(createWebhookRequest());

    expect(response.status).toBe(200);
    expect(syncSanbiUserFromClerkUser).not.toHaveBeenCalled();
    expect(markSanbiUserAuthDeleted).not.toHaveBeenCalled();
  });
});

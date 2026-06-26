import {
  createEventTypeFixture,
  createOrganizationMembershipWithOrganizationFixture,
  createSetWithSectionsSongsAndEventTypeFixture,
  createUserFixture,
} from "@testUtils/fixtures";
import { createUuid } from "@testUtils/generators/createUuid";
import { eq } from "drizzle-orm";

import { getProcedureLogger } from "@lib/loggers/logger";
import { setRouter } from "@server/api/routers/set";
import { db } from "@server/db";
import { organizations, sets, users } from "@server/db/schema";

const procedureLogger = {
  debug: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  info: jest.fn(),
  trace: jest.fn(),
  warn: jest.fn(),
  child: jest.fn(),
};

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "user_123" })),
}));
jest.mock("@lib/loggers/logger", () => ({
  getElapsedDurationMs: jest.fn(() => 1),
  getProcedureLogger: jest.fn(() => procedureLogger),
  logger: {
    child: jest.fn(() => procedureLogger),
  },
}));
jest.mock("superjson", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("@/server/db", () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
      },
      organizations: {
        findFirst: jest.fn(),
      },
    },
  },
}));

const userId = "user_123";

const createSetRouterCaller = (ctxDb: unknown) =>
  setRouter.createCaller({
    auth: { userId },
    db: ctxDb,
    headers: new Headers(),
  } as never);

const mockedAuthDb = db as unknown as {
  query: {
    users: {
      findFirst: jest.Mock;
    };
    organizations: {
      findFirst: jest.Mock;
    };
  };
};
const mockedGetProcedureLogger = getProcedureLogger as jest.Mock;

describe("setRouter", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrganizationSets", () => {
    it("returns sets for the authenticated user's organization", async () => {
      const organizationId = createUuid();
      const membership = createOrganizationMembershipWithOrganizationFixture({
        organizationId,
        userId,
      });
      const user = createUserFixture({
        id: userId,
      });
      const organization = membership.organization;
      const eventTypeId = createUuid();
      const eventType = createEventTypeFixture({
        id: eventTypeId,
        organizationId,
        name: "Sunday Service",
      });
      const organizationSets = [
        createSetWithSectionsSongsAndEventTypeFixture({
          organizationId,
          eventTypeId,
          eventType,
          sections: [],
        }),
      ];
      const membershipFindFirst = jest.fn().mockResolvedValue(membership);
      const setsFindMany = jest.fn().mockResolvedValue(organizationSets);
      const caller = createSetRouterCaller({
        query: {
          organizationMemberships: {
            findFirst: membershipFindFirst,
          },
          sets: {
            findMany: setsFindMany,
          },
        },
      });

      mockedAuthDb.query.users.findFirst.mockResolvedValue(user);
      mockedAuthDb.query.organizations.findFirst.mockResolvedValue(
        organization,
      );

      await expect(
        caller.getOrganizationSets({ organizationId }),
      ).resolves.toEqual(organizationSets);

      expect(mockedAuthDb.query.users.findFirst).toHaveBeenCalledWith({
        where: eq(users.id, userId),
      });
      expect(mockedAuthDb.query.organizations.findFirst).toHaveBeenCalledWith({
        where: eq(organizations.id, organizationId),
      });
      const [membershipQuery] = membershipFindFirst.mock.calls[0] as [
        {
          where: unknown;
          with: {
            organization: true;
          };
        },
      ];
      const [setsQuery] = setsFindMany.mock.calls[0] as [
        {
          where: unknown;
          with: {
            sections: {
              orderBy: unknown;
              with: {
                songs: {
                  orderBy: unknown;
                  with: {
                    song: true;
                  };
                };
                type: true;
              };
            };
            eventType: true;
          };
          orderBy: unknown;
        },
      ];

      expect(membershipQuery).toEqual({
        where: expect.any(Object) as unknown,
        with: {
          organization: true,
        },
      });
      expect(setsQuery).toEqual({
        where: eq(sets.organizationId, organizationId),
        with: {
          sections: {
            orderBy: expect.any(Function) as unknown,
            with: {
              songs: {
                orderBy: expect.any(Function) as unknown,
                with: {
                  song: true,
                },
              },
              type: true,
            },
          },
          eventType: true,
        },
        orderBy: expect.any(Function) as unknown,
      });
      expect(mockedGetProcedureLogger).toHaveBeenCalledWith({
        parentLogger: undefined,
        path: "getOrganizationSets",
        type: "query",
      });
      const organizationSetsCount = organizationSets.length;

      expect(procedureLogger.info).toHaveBeenCalledWith(
        {
          input: { organizationId },
          setCount: organizationSetsCount,
          userId,
        },
        "1 set found for organization",
      );
    });

    it("rejects organization set requests when the user is not a member", async () => {
      const organizationId = createUuid();
      const membershipFindFirst = jest.fn().mockResolvedValue(null);
      const setsFindMany = jest.fn();
      const caller = createSetRouterCaller({
        query: {
          organizationMemberships: {
            findFirst: membershipFindFirst,
          },
          sets: {
            findMany: setsFindMany,
          },
        },
      });

      mockedAuthDb.query.users.findFirst.mockResolvedValue({
        id: userId,
      });
      mockedAuthDb.query.organizations.findFirst.mockResolvedValue({
        id: organizationId,
      });

      await expect(
        caller.getOrganizationSets({ organizationId }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });

      expect(setsFindMany).not.toHaveBeenCalled();
    });
  });
});

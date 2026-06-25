import { createUuid } from "@testUtils/generators/createUuid";
import { createOrganizationSetFixture } from "@testUtils/models/set/fixtures";
import {
  createOrganizationMembershipFixture,
  createUserWithMembershipsFixture,
} from "@testUtils/models/user/fixtures";
import { eq } from "drizzle-orm";

import { logger } from "@lib/loggers/logger";
import { pluralize } from "@lib/string";
import { setRouter } from "@server/api/routers/set";
import { db } from "@server/db";
import { organizations, sets, users } from "@server/db/schema";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "user_123" })),
}));
jest.mock("@lib/loggers/logger", () => ({
  logger: {
    child: jest.fn(() => ({
      info: jest.fn(),
    })),
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
const mockedLogger = logger as unknown as {
  child: jest.Mock;
};

describe("setRouter", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrganizationSets", () => {
    it("returns sets for the authenticated user's organization", async () => {
      const organizationId = createUuid();
      const membership = createOrganizationMembershipFixture({
        organizationId,
        userId,
      });
      const user = createUserWithMembershipsFixture({
        id: userId,
        memberships: [membership],
      });
      const organization = membership.organization;
      const eventTypeId = createUuid();
      const organizationSets = [
        createOrganizationSetFixture({
          organizationId,
          eventTypeId,
          eventType: {
            id: eventTypeId,
            name: "Sunday Service",
            organizationId,
            favoritedAt: null,
            createdAt: new Date("2026-01-01T00:00:00Z"),
            updatedAt: new Date("2026-01-01T00:00:00Z"),
          },
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
      expect(mockedLogger.child).toHaveBeenCalledWith({
        route: "/set/organization",
        input: { organizationId },
        userId,
      });
      const loggerChild = mockedLogger.child.mock.results[0]?.value as {
        info: jest.Mock;
      };
      const organizationSetsCount = organizationSets.length;

      expect(loggerChild.info).toHaveBeenCalledWith(
        { setCount: organizationSetsCount },
        `${organizationSetsCount} ${pluralize(organizationSetsCount, { singular: "set", plural: "sets" })} found for organization`,
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

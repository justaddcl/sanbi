import {
  createOrganizationMembershipWithOrganizationFixture,
  createSetSectionFixture,
  createUserFixture,
} from "@testUtils/fixtures";
import { createUuid } from "@testUtils/generators/createUuid";
import { and, eq, gt, sql } from "drizzle-orm";

import { setSectionRouter } from "@server/api/routers/setSection";
import { organizations, setSections, users } from "@server/db/schema";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(() => ({ userId: "user_123" })),
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

type MockSetSectionRouterDb = {
  query: {
    organizationMemberships: {
      findFirst: jest.Mock;
    };
    setSections: {
      findMany?: jest.Mock;
      findFirst: jest.Mock;
    };
  };
  transaction: jest.Mock;
  delete: jest.Mock;
  update: jest.Mock;
};

const userId = "user_123";
const organizationId = createUuid();
const membership = createOrganizationMembershipWithOrganizationFixture({
  organizationId,
  userId,
});
const organization = membership.organization;
const user = createUserFixture({
  id: userId,
});

const mockedServerDb: {
  db: {
    query: {
      users: {
        findFirst: jest.Mock;
      };
      organizations: {
        findFirst: jest.Mock;
      };
    };
  };
} = jest.requireMock("@/server/db");

const createCaller = (db: MockSetSectionRouterDb) =>
  setSectionRouter.createCaller({
    auth: { userId },
    db,
    headers: new Headers(),
  } as never);

const createDeleteSetSectionDb = ({
  deletedSectionId,
  deleteReturnsSection = true,
  organizationMembership = membership,
  sections,
}: {
  deletedSectionId: string;
  deleteReturnsSection?: boolean;
  organizationMembership?: ReturnType<
    typeof createOrganizationMembershipWithOrganizationFixture
  >;
  sections: ReturnType<typeof createSetSectionFixture>[];
}) => {
  let deletedSection: ReturnType<typeof createSetSectionFixture> | undefined;
  const findFirst = jest.fn(async () => {
    return sections.find((section) => section.id === deletedSectionId) ?? null;
  });
  const deleteReturning = jest.fn(async () => {
    if (!deleteReturnsSection) {
      return [];
    }

    const deletedSectionIndex = sections.findIndex(
      (section) => section.id === deletedSectionId,
    );

    if (deletedSectionIndex === -1) {
      return [];
    }

    const [section] = sections.splice(deletedSectionIndex, 1);
    deletedSection = section;

    return section ? [section] : [];
  });
  const deleteWhere = jest.fn(() => ({
    returning: deleteReturning,
  }));
  const deleteFrom = jest.fn(() => ({
    where: deleteWhere,
  }));
  const updateWhere = jest.fn(async () => {
    if (!deletedSection) {
      return;
    }

    sections.forEach((section) => {
      if (
        section.setId === deletedSection?.setId &&
        section.position > deletedSection.position
      ) {
        section.position -= 1;
      }
    });
  });
  const updateSet = jest.fn(() => ({
    where: updateWhere,
  }));
  const updateTable = jest.fn(() => ({
    set: updateSet,
  }));
  const transactionDb = {
    query: {
      setSections: {
        findFirst,
      },
    },
    delete: deleteFrom,
    update: updateTable,
  };
  const db = {
    query: {
      organizationMemberships: {
        findFirst: jest.fn().mockResolvedValue(organizationMembership),
      },
      setSections: {
        findFirst,
      },
    },
    transaction: jest.fn(
      async (callback: (transaction: typeof transactionDb) => unknown) =>
        await callback(transactionDb),
    ),
    delete: deleteFrom,
    update: updateTable,
  };

  return {
    db,
    deleteFrom,
    deleteReturning,
    deleteWhere,
    findFirst,
    updateSet,
    updateTable,
    updateWhere,
  };
};

const expectSetSectionLookup = (findFirst: jest.Mock, setSectionId: string) => {
  expect(findFirst).toHaveBeenCalledWith({
    where: eq(setSections.id, setSectionId),
  });
};

describe("setSectionRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(console, "info").mockImplementation(() => undefined);
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    mockedServerDb.db.query.users.findFirst.mockResolvedValue(user);
    mockedServerDb.db.query.organizations.findFirst.mockResolvedValue(
      organization,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("delete", () => {
    it("returns NOT_FOUND when the set section does not exist", async () => {
      const setSectionId = createUuid();
      const { db, deleteFrom, findFirst, updateTable } =
        createDeleteSetSectionDb({
          deletedSectionId: setSectionId,
          sections: [],
        });

      await expect(
        createCaller(db).delete({ organizationId, setSectionId }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });

      expect(mockedServerDb.db.query.users.findFirst).toHaveBeenCalledWith({
        where: eq(users.id, userId),
      });
      expect(
        mockedServerDb.db.query.organizations.findFirst,
      ).toHaveBeenCalledWith({
        where: eq(organizations.id, organizationId),
      });
      expectSetSectionLookup(findFirst, setSectionId);
      expect(deleteFrom).not.toHaveBeenCalled();
      expect(updateTable).not.toHaveBeenCalled();
    });

    it("returns FORBIDDEN for non-admin organization members", async () => {
      const setSection = createSetSectionFixture({
        organizationId,
      });
      const memberMembership =
        createOrganizationMembershipWithOrganizationFixture({
          organization,
          organizationId,
          permissionType: "member",
          userId,
        });
      const { db, deleteFrom, findFirst, updateTable } =
        createDeleteSetSectionDb({
          deletedSectionId: setSection.id,
          organizationMembership: memberMembership,
          sections: [setSection],
        });

      await expect(
        createCaller(db).delete({
          organizationId,
          setSectionId: setSection.id,
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });

      expect(findFirst).not.toHaveBeenCalled();
      expect(deleteFrom).not.toHaveBeenCalled();
      expect(updateTable).not.toHaveBeenCalled();
    });

    it("returns FORBIDDEN for a set section in another organization", async () => {
      const setSection = createSetSectionFixture({
        organizationId: createUuid(),
      });
      const { db, deleteFrom, findFirst, updateTable } =
        createDeleteSetSectionDb({
          deletedSectionId: setSection.id,
          sections: [setSection],
        });

      await expect(
        createCaller(db).delete({
          organizationId,
          setSectionId: setSection.id,
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });

      expectSetSectionLookup(findFirst, setSection.id);
      expect(deleteFrom).not.toHaveBeenCalled();
      expect(updateTable).not.toHaveBeenCalled();
    });

    it("deletes the target set section and compacts later sections in the same set", async () => {
      const setId = createUuid();
      const otherSetId = createUuid();
      const firstSection = createSetSectionFixture({
        organizationId,
        position: 0,
        setId,
      });
      const deletedSection = createSetSectionFixture({
        organizationId,
        position: 1,
        setId,
      });
      const laterSection = createSetSectionFixture({
        organizationId,
        position: 2,
        setId,
      });
      const otherSetSection = createSetSectionFixture({
        organizationId,
        position: 2,
        setId: otherSetId,
      });
      const sections = [
        firstSection,
        deletedSection,
        laterSection,
        otherSetSection,
      ];
      const {
        db,
        deleteFrom,
        deleteWhere,
        findFirst,
        updateSet,
        updateTable,
        updateWhere,
      } = createDeleteSetSectionDb({
        deletedSectionId: deletedSection.id,
        sections,
      });

      await expect(
        createCaller(db).delete({
          organizationId,
          setSectionId: deletedSection.id,
        }),
      ).resolves.toEqual(deletedSection);

      expectSetSectionLookup(findFirst, deletedSection.id);
      expect(deleteFrom).toHaveBeenCalledWith(setSections);
      expect(deleteWhere).toHaveBeenCalledWith(
        eq(setSections.id, deletedSection.id),
      );
      expect(updateTable).toHaveBeenCalledWith(setSections);
      expect(updateSet).toHaveBeenCalledWith({
        position: sql`position - 1`,
      });
      expect(updateWhere).toHaveBeenCalledWith(
        and(
          eq(setSections.setId, deletedSection.setId),
          gt(setSections.position, deletedSection.position),
        ),
      );
    });

    it("returns INTERNAL_SERVER_ERROR when delete returns no set section", async () => {
      const setSection = createSetSectionFixture({
        organizationId,
      });
      const { db, deleteReturning, findFirst, updateTable } =
        createDeleteSetSectionDb({
          deletedSectionId: setSection.id,
          deleteReturnsSection: false,
          sections: [setSection],
        });

      await expect(
        createCaller(db).delete({
          organizationId,
          setSectionId: setSection.id,
        }),
      ).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete set section",
      });

      expectSetSectionLookup(findFirst, setSection.id);
      expect(deleteReturning).toHaveBeenCalled();
      expect(updateTable).not.toHaveBeenCalled();
    });

    it("maps unexpected delete failures to INTERNAL_SERVER_ERROR", async () => {
      const setSectionId = createUuid();
      const db = {
        query: {
          organizationMemberships: {
            findFirst: jest.fn().mockResolvedValue(membership),
          },
          setSections: {
            findFirst: jest.fn(),
          },
        },
        transaction: jest.fn().mockRejectedValue(new Error("database offline")),
        delete: jest.fn(),
        update: jest.fn(),
      };

      await expect(
        createCaller(db).delete({ organizationId, setSectionId }),
      ).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to delete set section ${setSectionId}`,
      });
    });
  });

  describe("getSectionsForSet", () => {
    it("returns sections and songs ordered by their set positions", async () => {
      const setId = createUuid();
      const sectionsForSet = [
        createSetSectionFixture({ organizationId, position: 0, setId }),
        createSetSectionFixture({ organizationId, position: 1, setId }),
      ];
      const findMany = jest.fn().mockResolvedValue(sectionsForSet);
      const db = {
        query: {
          organizationMemberships: {
            findFirst: jest.fn().mockResolvedValue(membership),
          },
          setSections: {
            findMany,
            findFirst: jest.fn(),
          },
        },
        transaction: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      };

      await expect(
        createCaller(db).getSectionsForSet({ organizationId, setId }),
      ).resolves.toEqual(sectionsForSet);

      expect(findMany).toHaveBeenCalledWith({
        where: eq(setSections.setId, setId),
        orderBy: expect.any(Function) as unknown,
        with: {
          type: true,
          songs: {
            orderBy: expect.any(Function) as unknown,
            with: {
              song: true,
            },
          },
        },
      });
    });
  });
});

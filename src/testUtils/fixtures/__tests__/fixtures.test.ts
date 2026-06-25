import {
  createSetDataAccessFixture,
  createSetDomainFixture,
  createSetSectionDataAccessFixture,
  createSetSectionSongDataAccessFixture,
  createSetSectionTypeName,
} from "@testUtils/fixtures";

describe("set fixtures", () => {
  it("creates a complete valid set graph with shared organization ids", () => {
    const fixture = createSetDomainFixture();

    expect(fixture.membership.organizationId).toBe(fixture.organization.id);
    expect(fixture.eventType.organizationId).toBe(fixture.organization.id);
    expect(fixture.set.organizationId).toBe(fixture.organization.id);
    expect(fixture.set.eventTypeId).toBe(fixture.eventType.id);
    expect(fixture.setWithSections.eventType.id).toBe(fixture.eventType.id);
    expect(fixture.setWithSections.eventType).toHaveProperty("favoritedAt");
    expect(fixture.setSection.setId).toBe(fixture.set.id);
    expect(fixture.setSection.sectionTypeId).toBe(fixture.sectionType.id);
    expect(fixture.setSectionSong.setSectionId).toBe(fixture.setSection.id);
    expect(fixture.setSectionSong.songId).toBe(fixture.song.id);
    expect(fixture.tag.organizationId).toBe(fixture.organization.id);
    expect(fixture.resource.songId).toBe(fixture.song.id);
    expect(fixture.setWithSections.sections[0]?.songs[0]?.song.name).toBe(
      fixture.song.name,
    );
  });

  it("builds narrow mocked data-access seams for service tests", async () => {
    const fixture = createSetDomainFixture();
    const setDataAccess = createSetDataAccessFixture({
      findSetWithSectionsById: jest
        .fn()
        .mockResolvedValue(fixture.setWithSections),
    });
    const setSectionDataAccess = createSetSectionDataAccessFixture({
      findSetSectionsBySetId: jest
        .fn()
        .mockResolvedValue(fixture.setWithSections.sections),
    });
    const setSectionSongDataAccess = createSetSectionSongDataAccessFixture({
      findSetSectionSongsBySetSectionId: jest
        .fn()
        .mockResolvedValue(fixture.setWithSections.sections[0]?.songs ?? []),
    });

    await expect(
      setDataAccess.findSetWithSectionsById(fixture.set.id),
    ).resolves.toBe(fixture.setWithSections);
    await expect(
      setSectionDataAccess.findSetSectionsBySetId(fixture.set.id),
    ).resolves.toEqual(fixture.setWithSections.sections);
    await expect(
      setSectionSongDataAccess.findSetSectionSongsBySetSectionId(
        fixture.setSection.id,
      ),
    ).resolves.toEqual(fixture.setWithSections.sections[0]?.songs);
  });

  it("uses domain section type names", () => {
    expect(["Full band", "Prayer", "Communion"]).toContain(
      createSetSectionTypeName(),
    );
  });
});

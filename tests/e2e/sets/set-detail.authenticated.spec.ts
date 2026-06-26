import { expect, type Page, test, type TestInfo } from "@playwright/test";
import { e2eData, e2eIds } from "@testUtils/e2e/fixtures";
import { eq } from "drizzle-orm";

import { formatDate } from "@lib/date";
import { formatSongKey } from "@lib/string/formatSongKey";
import { db } from "@server/db";
import { setSectionSongs } from "@server/db/schema";

import { expectNoA11yViolations } from "../a11y";

const getSetSectionCard = (page: Page, sectionName: string) =>
  page
    .getByTestId("set-section-card")
    .filter({ has: page.getByRole("heading", { name: sectionName }) });

type AddSongToSetSong =
  | typeof e2eData.set.addSongToSet.desktopSong
  | typeof e2eData.set.addSongToSet.mobileSong;

const getAddSongToSetSong = (projectName: string): AddSongToSetSong =>
  projectName.includes("mobile")
    ? e2eData.set.addSongToSet.mobileSong
    : e2eData.set.addSongToSet.desktopSong;

const expectAddedSongInFullBandSection = async (
  page: Page,
  song: AddSongToSetSong,
) => {
  const fullBandSection = getSetSectionCard(
    page,
    e2eData.sectionTypes.fullBand,
  );
  const addSongToSet = e2eData.set.addSongToSet;

  await expect(fullBandSection).toContainText(song.name);
  await expect(fullBandSection).toContainText(formatSongKey(addSongToSet.key));
  await expect(fullBandSection).toContainText(addSongToSet.notes);
};

const getReplaceSongFixture = (projectName: TestInfo["project"]["name"]) =>
  projectName.includes("mobile")
    ? {
        id: "abababab-abab-4bab-8bab-abababababab",
        notes: "Mobile replacement fixture notes.",
        position: 99,
      }
    : {
        id: "acacacac-acac-4cac-8cac-acacacacacac",
        notes: "Desktop replacement fixture notes.",
        position: 98,
      };

type ReplaceSongFixture = ReturnType<typeof getReplaceSongFixture>;

const deleteReplaceSongFixture = async (fixture: ReplaceSongFixture) => {
  await db.delete(setSectionSongs).where(eq(setSectionSongs.id, fixture.id));
};

const resetReplaceSongFixture = async (fixture: ReplaceSongFixture) => {
  await db.transaction(async (transaction) => {
    await transaction
      .delete(setSectionSongs)
      .where(eq(setSectionSongs.id, fixture.id));

    await transaction.insert(setSectionSongs).values({
      id: fixture.id,
      setSectionId: e2eIds.fullBandSectionId,
      songId: e2eIds.firstSongId,
      position: fixture.position,
      key: "g",
      notes: fixture.notes,
      organizationId: e2eIds.organizationId,
    });
  });
};

const openGlobalSearch = async (page: Page, isMobileProject: boolean) => {
  if (!isMobileProject) {
    await page.keyboard.press("ControlOrMeta+K");
    return;
  }

  const searchButton = page.getByRole("button", {
    name: "Open global search",
  });
  const trigger = await searchButton
    .waitFor({ state: "visible", timeout: 5_000 })
    .then(() => searchButton)
    .catch(() => page.getByRole("textbox", { name: "Search" }));

  await trigger.tap();
};

test("set detail renders seeded sections, songs, and notes", async ({
  page,
}) => {
  const expectedSetHeading = formatDate(e2eData.set.date, { month: "long" });

  await page.goto(`/${e2eIds.organizationId}/sets/${e2eIds.setId}`);

  await expect(
    page.getByRole("heading", { name: expectedSetHeading }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: e2eData.eventType.name }),
  ).toBeVisible();
  await expect(page.getByText(e2eData.set.notes)).toBeVisible();
  await expect(page.getByText(e2eData.sectionTypes.fullBand)).toBeVisible();
  await expect(page.getByText(e2eData.sectionTypes.prayer)).toBeVisible();
  await expect(page.getByText(e2eData.songs.first.name)).toBeVisible();
  await expect(page.getByText(e2eData.songs.first.setNotes)).toBeVisible();
  await expect(page.getByText(e2eData.songs.second.name)).toBeVisible();

  await expectNoA11yViolations(page, {
    include: "main",
    exclude: ["[data-nextjs-toast]", "nextjs-portal"],
  });
});

test("adds a song to a section from set detail", async ({ page }, testInfo) => {
  const addSongToSet = e2eData.set.addSongToSet;
  const songToAdd = getAddSongToSetSong(testInfo.project.name);

  await page.goto(`/${e2eIds.organizationId}/sets/${e2eIds.setId}`);

  const fullBandSection = getSetSectionCard(
    page,
    e2eData.sectionTypes.fullBand,
  );
  await expect(fullBandSection).toBeVisible();

  if (await fullBandSection.getByText(songToAdd.name).first().isVisible()) {
    await expectAddedSongInFullBandSection(page, songToAdd);
    await page.reload();
    await expectAddedSongInFullBandSection(page, songToAdd);
    return;
  }

  await fullBandSection
    .getByRole("button", {
      name: `Add song to ${e2eData.sectionTypes.fullBand} section`,
    })
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder("Search songs or tags").fill(e2eData.tag.tag);
  await expect(dialog.getByText(songToAdd.name, { exact: true })).toBeVisible();
  await dialog.getByText(songToAdd.name, { exact: true }).click();

  await expect(
    dialog.getByRole("heading", { name: "Add song to set" }),
  ).toBeVisible();
  await expect(dialog.getByText(songToAdd.name, { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole("radio", { name: e2eData.sectionTypes.fullBand }),
  ).toBeChecked();
  await dialog.getByRole("combobox", { name: "Song key" }).click();
  await page
    .getByRole("option", {
      name: formatSongKey(addSongToSet.key),
      exact: true,
    })
    .click();
  await dialog.getByLabel("Song notes").fill(addSongToSet.notes);

  const addSongButton = dialog.getByRole("button", {
    name: "Add song",
    exact: true,
  });
  await expect(addSongButton).toBeEnabled();
  await addSongButton.click();

  await expect(page.getByText("Song added to the set!")).toBeVisible();
  await expect(dialog).toBeHidden();
  await expectAddedSongInFullBandSection(page, songToAdd);

  await page.reload();
  await expectAddedSongInFullBandSection(page, songToAdd);
});

test("opens add-to-set from the search action menu without navigating", async ({
  page,
}, testInfo) => {
  const isMobileProject = testInfo.project.name.includes("mobile");
  const songToAdd = getAddSongToSetSong(testInfo.project.name);
  const setDetailPath = `/${e2eIds.organizationId}/sets/${e2eIds.setId}`;

  await page.goto(setDetailPath);
  await expect(
    page.getByRole("heading", { name: e2eData.eventType.name }),
  ).toBeVisible();
  await openGlobalSearch(page, isMobileProject);

  const searchDialog = page.getByRole("dialog");
  await expect(searchDialog).toBeVisible();
  await searchDialog
    .getByPlaceholder("Search songs or tags")
    .fill(songToAdd.name);
  await expect(
    searchDialog.getByText(songToAdd.name, { exact: true }),
  ).toBeVisible();

  if (isMobileProject) {
    await searchDialog
      .getByRole("button", { name: `Open actions for ${songToAdd.name}` })
      .tap();
    await page.getByRole("menuitem", { name: /Add to a set/ }).tap();
  } else {
    await page.keyboard.press("Shift+Enter");
    await expect(
      page.getByRole("menuitem", { name: /Open song/ }),
    ).toBeVisible();
    await page.getByRole("menuitem", { name: /Add to a set/ }).press("Enter");
  }

  await expect(
    page.getByRole("heading", { name: "Add to which set?" }),
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${setDetailPath}$`));
});

test("replaces a set song through the unified picker", async ({
  page,
}, testInfo) => {
  const replaceSongFixture = getReplaceSongFixture(testInfo.project.name);
  await resetReplaceSongFixture(replaceSongFixture);

  try {
    await page.goto(`/${e2eIds.organizationId}/sets/${e2eIds.setId}`);

    const fullBandSection = getSetSectionCard(
      page,
      e2eData.sectionTypes.fullBand,
    );
    const replacementFixtureSongRow = fullBandSection.locator("form").filter({
      hasText: replaceSongFixture.notes,
    });

    await expect(replacementFixtureSongRow).toBeVisible();
    await expect(replacementFixtureSongRow).toContainText(
      e2eData.songs.first.name,
    );
    await replacementFixtureSongRow
      .getByRole("button", { name: "Open actions menu" })
      .click();
    await page.getByRole("menuitem", { name: /Replace song/ }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog
      .getByPlaceholder("Search songs or tags")
      .fill(e2eData.songs.second.name);
    await expect(
      dialog.getByText(e2eData.songs.second.name, { exact: true }),
    ).toBeVisible();
    await dialog.getByText(e2eData.songs.second.name, { exact: true }).click();

    await expect(
      dialog.getByText("Current song", { exact: true }),
    ).toBeVisible();
    await expect(dialog.getByText("New song", { exact: true })).toBeVisible();
    await expect(dialog.getByText(e2eData.songs.first.name)).toBeVisible();
    await expect(dialog.getByText(e2eData.songs.second.name)).toBeVisible();
    await dialog.getByRole("button", { name: "Replace song" }).click();

    await expect(page.getByText("Song replaced")).toBeVisible();
    await expect(dialog).toBeHidden();
    await expect(replacementFixtureSongRow).toContainText(
      e2eData.songs.second.name,
    );
    await expect(replacementFixtureSongRow).not.toContainText(
      e2eData.songs.first.name,
    );

    await page.reload();
    await expect(replacementFixtureSongRow).toContainText(
      e2eData.songs.second.name,
    );
    await expect(replacementFixtureSongRow).not.toContainText(
      e2eData.songs.first.name,
    );
  } finally {
    await deleteReplaceSongFixture(replaceSongFixture);
  }
});

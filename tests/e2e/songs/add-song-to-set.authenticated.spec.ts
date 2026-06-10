import {
  expect,
  type Locator,
  type Page,
  test,
  type TestInfo,
} from "@playwright/test";
import { e2eData, e2eIds } from "@testUtils/e2e/fixtures";
import { eq } from "drizzle-orm";

import { formatFriendlyDate } from "@lib/date";
import { formatSongKey } from "@lib/string/formatSongKey";
import { db } from "@server/db";
import { setSectionSongs } from "@server/db/schema";

type AddSongToSetFixture = {
  id: string;
  name: string;
  notes: string;
  preferredKey: Parameters<typeof formatSongKey>[0];
  setNotes: string;
  sectionName: string;
  existingSongName: string;
  existingSetSectionSongId: string;
};

const totalAddSongToSetSteps = 5;
const firstSongPosition = 1;
const expectedInitialSectionSongCount = 2;
const selectedSongPosition = 2;
const selectedSongKey = "d";

const getAddSongToSetFixture = (
  projectName: TestInfo["project"]["name"],
): AddSongToSetFixture =>
  projectName.includes("mobile")
    ? {
        id: e2eIds.addSongToSetFromSongDetailMobileSongId,
        ...e2eData.songs.addSongToSetFromSongDetailMobile,
        sectionName: e2eData.sectionTypes.songDetailMobile,
        existingSongName: e2eData.songs.songDetailMobileAnchor.name,
        existingSetSectionSongId: e2eIds.songDetailMobileSetSectionSongId,
      }
    : {
        id: e2eIds.addSongToSetFromSongDetailDesktopSongId,
        ...e2eData.songs.addSongToSetFromSongDetailDesktop,
        sectionName: e2eData.sectionTypes.songDetailDesktop,
        existingSongName: e2eData.songs.songDetailDesktopAnchor.name,
        existingSetSectionSongId: e2eIds.songDetailDesktopSetSectionSongId,
      };

const getSetSectionCard = (page: Page, sectionName: string) =>
  page
    .getByTestId("set-section-card")
    .filter({ has: page.getByRole("heading", { name: sectionName }) });

const getDialogCardByHeading = (root: Page | Locator, headingName: string) =>
  root
    .getByTestId("set-section-selection-card")
    .filter({ has: root.getByRole("heading", { name: headingName }) });

const getDialogSummaryGroup = (dialog: Locator, label: string) =>
  dialog
    .getByTestId("add-song-review-summary-group")
    .filter({ has: dialog.getByText(label, { exact: true }) });

const getSongRow = (root: Page | Locator, songName: string) =>
  root
    .getByTestId("song-content")
    .filter({ has: root.getByText(songName, { exact: true }) });

const expectDialogStep = async (
  dialog: Locator,
  step: number,
  title: string,
) => {
  await expect(dialog.getByRole("heading", { name: title })).toBeVisible();
  await expect(
    dialog.getByText(`${step}/${totalAddSongToSetSteps}`, { exact: true }),
  ).toBeVisible();
};

const dragLocatorToLocator = async (
  page: Page,
  source: Locator,
  target: Locator,
) => {
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error("Could not find drag source or target bounds.");
  }

  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { steps: 12 },
  );
  await page.mouse.up();
};

const getAddedSongInSelectedSection = (
  page: Page,
  song: AddSongToSetFixture,
) => {
  const selectedSection = getSetSectionCard(page, song.sectionName);

  return selectedSection.locator("form").filter({
    hasText: song.name,
  });
};

const expectSongInSelectedSection = async (
  page: Page,
  song: AddSongToSetFixture,
) => {
  const addedSong = getAddedSongInSelectedSection(page, song);

  await expect(addedSong).toBeVisible();
  await expect(addedSong).toContainText(formatSongKey(selectedSongKey));
  await expect(addedSong).toContainText(song.setNotes);
};

const resetAddSongToSetFixture = async (song: AddSongToSetFixture) => {
  await db.transaction(async (transaction) => {
    await transaction
      .delete(setSectionSongs)
      .where(eq(setSectionSongs.songId, song.id));

    await transaction
      .update(setSectionSongs)
      .set({ position: 0 })
      .where(eq(setSectionSongs.id, song.existingSetSectionSongId));
  });
};

test("song detail workflow adds a song to an existing set section", async ({
  page,
}, testInfo) => {
  const song = getAddSongToSetFixture(testInfo.project.name);

  await resetAddSongToSetFixture(song);

  await page.goto(`/${e2eIds.organizationId}/songs/${song.id}`);
  await expect(page.getByRole("heading", { name: song.name })).toBeVisible();

  await page.getByRole("button", { name: "Add to a set" }).click();

  const dialog = page.getByRole("dialog");
  await expectDialogStep(dialog, 1, "Add to which set?");

  await dialog.getByText(e2eData.eventType.name).first().click();
  await expectDialogStep(dialog, 2, "Which section?");

  const selectedSection = getDialogCardByHeading(dialog, song.sectionName);
  await selectedSection.getByRole("button", { name: /Select/ }).click();

  await expectDialogStep(dialog, 3, "When will you play it?");

  const positionInput = dialog.locator("input[type='number']");
  const sectionSongCount = String(expectedInitialSectionSongCount);
  const firstPosition = String(firstSongPosition);
  const selectedPosition = String(selectedSongPosition);
  await expect(positionInput).toHaveValue(sectionSongCount);
  await expect(getSongRow(dialog, song.name)).toContainText(
    `${sectionSongCount}.`,
  );

  await dragLocatorToLocator(
    page,
    getSongRow(dialog, song.name),
    getSongRow(dialog, song.existingSongName),
  );

  await expect(positionInput).toHaveValue(firstPosition);
  await expect(getSongRow(dialog, song.name)).toContainText(
    `${firstPosition}.`,
  );

  await positionInput.fill(selectedPosition);
  await expect(positionInput).toHaveValue(selectedPosition);
  await expect(getSongRow(dialog, song.name)).toContainText(
    `${selectedPosition}.`,
  );

  await page.mouse.move(0, 0);
  const confirmSongPositionButton = dialog.getByRole("button", {
    name: "Confirm song position",
  });
  await expect(confirmSongPositionButton).toBeEnabled();
  await confirmSongPositionButton.click();

  await expectDialogStep(dialog, 4, "What key will you play in?");
  await expect(
    dialog.getByText(`Preferred key: ${formatSongKey(song.preferredKey)}`),
  ).toBeVisible();
  await dialog
    .getByRole("button", {
      name: formatSongKey(selectedSongKey),
      exact: true,
    })
    .click();

  await expectDialogStep(dialog, 5, "Review");
  await expect(getDialogSummaryGroup(dialog, "Adding")).toContainText(
    song.name,
  );
  await expect(getDialogSummaryGroup(dialog, "Played in")).toContainText(
    formatSongKey(selectedSongKey),
  );
  await expect(getDialogSummaryGroup(dialog, "In set")).toContainText(
    formatFriendlyDate(e2eData.set.date),
  );
  await expect(getDialogSummaryGroup(dialog, "In set")).toContainText(
    e2eData.eventType.name,
  );

  const reviewSection = getDialogSummaryGroup(dialog, "In section");
  await expect(reviewSection).toContainText(song.sectionName);
  await expect(reviewSection).toContainText(song.name);
  await expect(reviewSection).toContainText(`${selectedPosition}.`);

  await dialog.locator("textarea").fill(song.setNotes);
  await dialog.getByRole("button", { name: "Add song to set" }).click();
  await expect(page.getByText("Song added to set!")).toBeVisible();
  await expect(dialog).toBeHidden({ timeout: 15_000 });

  await page.goto(`/${e2eIds.organizationId}/sets/${e2eIds.setId}`);
  await expectSongInSelectedSection(page, song);

  await page.reload();
  await expectSongInSelectedSection(page, song);
});

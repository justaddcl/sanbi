import { expect, type Locator, type Page, test } from "@playwright/test";
import { e2eData, e2eIds } from "@testUtils/e2e/fixtures";
import { addWeeks, nextSunday } from "date-fns";

import { type SongKey } from "@lib/constants";
import { formatDate } from "@lib/date";
import { getFirstSundayOfNextMonth } from "@lib/date/getFirstSundayOfNextMonth";
import { formatSongKey } from "@lib/string/formatSongKey";

test.setTimeout(90_000);

type AddSongToNewSetSong =
  | typeof e2eData.set.addSongToSet.desktopSong
  | typeof e2eData.set.addSongToSet.mobileSong;

type AddSongToNewSetConfig = {
  datePresetLabel: "Sunday After Next" | "First Sunday of Next Month";
  setDate: string;
  setNotes: string;
  song: AddSongToNewSetSong;
  songId: string;
  songKey: SongKey;
  songNotes: string;
  sectionName: string;
};

const toDateInputValue = (date: Date) => date.toLocaleDateString("en-CA");

const getAddSongToNewSetConfig = (
  projectName: string,
): AddSongToNewSetConfig => {
  const upcomingSunday = nextSunday(new Date());

  if (projectName.includes("mobile")) {
    return {
      datePresetLabel: "First Sunday of Next Month",
      setDate: toDateInputValue(getFirstSundayOfNextMonth(new Date())),
      setNotes: "E2E mobile add-to-new-set workflow notes.",
      song: e2eData.set.addSongToSet.mobileSong,
      songId: e2eIds.addSongToSetMobileSongId,
      songKey: "b_flat",
      songNotes: "Mobile adds this song after creating the set and section.",
      sectionName: e2eData.sectionTypes.prayer,
    };
  }

  return {
    datePresetLabel: "Sunday After Next",
    setDate: toDateInputValue(addWeeks(upcomingSunday, 1)),
    setNotes: "E2E desktop add-to-new-set workflow notes.",
    song: e2eData.set.addSongToSet.desktopSong,
    songId: e2eIds.addSongToSetDesktopSongId,
    songKey: "f_sharp",
    songNotes: "Desktop adds this song after creating the set and section.",
    sectionName: e2eData.sectionTypes.prayer,
  };
};

const getSetSectionCard = (page: Page, sectionName: string) =>
  page
    .getByTestId("set-section-card")
    .filter({ has: page.getByRole("heading", { name: sectionName }) });

const getPersistedPlayHistoryLink = (
  page: Page,
  config: AddSongToNewSetConfig,
): Locator =>
  page
    .getByRole("link")
    .filter({ hasText: formatDate(config.setDate, { format: "long" }) })
    .filter({ hasText: e2eData.eventType.name })
    .filter({ hasText: formatSongKey(config.songKey) })
    .filter({ hasText: new RegExp(config.sectionName, "i") });

const expectAddedSongOnNewSetPage = async (
  page: Page,
  config: AddSongToNewSetConfig,
) => {
  await expect(
    page.getByRole("heading", {
      name: formatDate(config.setDate, {
        locale: "en-US",
        month: "long",
        day: "2-digit",
      }),
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: e2eData.eventType.name }),
  ).toBeVisible();
  await expect(page.getByText(config.setNotes)).toBeVisible();

  const sectionCard = getSetSectionCard(page, config.sectionName);
  await expect(sectionCard).toBeVisible();
  await expect(sectionCard).toContainText(config.song.name);
  await expect(sectionCard).toContainText(formatSongKey(config.songKey));
  await expect(sectionCard).toContainText(config.songNotes);
};

const openPersistedSetFromSongHistory = async (
  page: Page,
  config: AddSongToNewSetConfig,
) => {
  const playHistoryLink = getPersistedPlayHistoryLink(page, config).first();

  await expect(playHistoryLink).toBeVisible({ timeout: 20_000 });
  await playHistoryLink.click();
  await expect(page).toHaveURL(/\/sets\//);
  await expectAddedSongOnNewSetPage(page, config);
};

test("adds a song to a newly created set with a newly created section", async ({
  page,
}, testInfo) => {
  const config = getAddSongToNewSetConfig(testInfo.project.name);

  await page.goto(`/${e2eIds.organizationId}/songs/${config.songId}`);
  await expect(
    page.getByRole("heading", { name: config.song.name }),
  ).toBeVisible();
  await expect(page.getByText("Song added to library")).toBeVisible();

  const existingPlayHistoryLink = getPersistedPlayHistoryLink(
    page,
    config,
  ).first();
  const hasExistingPlayHistory = await existingPlayHistoryLink
    .waitFor({ state: "visible", timeout: 3_000 })
    .then(() => true)
    .catch(() => false);

  if (hasExistingPlayHistory) {
    await openPersistedSetFromSongHistory(page, config);
    return;
  }

  await page.getByRole("button", { name: "Add to a set" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Add to which set?" }),
  ).toBeVisible();

  await dialog.getByRole("button", { name: "Create set" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Create new set" }),
  ).toBeVisible();

  await dialog.getByRole("button", { name: "Pick a date" }).click();
  await page
    .getByRole("combobox", { name: "Quick select date" })
    .click();
  await page.getByRole("option", { name: config.datePresetLabel }).click();

  await dialog
    .getByRole("combobox", { name: "Select event type" })
    .click();
  await page
    .getByRole("option", { name: e2eData.eventType.name })
    .click();

  await dialog.getByLabel("Set notes").fill(config.setNotes);

  const createSetButton = dialog.getByRole("button", { name: "Create set" });
  await expect(createSetButton).toBeEnabled();
  await createSetButton.click();

  await expect(
    dialog.getByRole("heading", { name: "Which section?" }),
  ).toBeVisible({ timeout: 20_000 });
  await dialog.getByRole("button", { name: "Add section" }).click();
  await dialog.getByRole("combobox", { name: "Select section type" }).click();
  await page.getByRole("option", { name: config.sectionName }).click();

  const addSectionButton = dialog.getByRole("button", {
    name: "Add section to set",
  });
  await expect(addSectionButton).toBeEnabled();
  await addSectionButton.click();

  await expect(
    dialog.getByRole("heading", { name: "When will you play it?" }),
  ).toBeVisible({ timeout: 20_000 });
  await dialog
    .getByRole("button", { name: "Confirm song position" })
    .click();

  await expect(
    dialog.getByRole("heading", { name: "What key will you play in?" }),
  ).toBeVisible();
  await dialog
    .getByRole("button", {
      name: formatSongKey(config.songKey),
      exact: true,
    })
    .click();

  await expect(dialog.getByRole("heading", { name: "Review" })).toBeVisible();
  await dialog.getByLabel("Song notes").fill(config.songNotes);

  const addSongButton = dialog.getByRole("button", {
    name: "Add song to set",
  });
  await expect(addSongButton).toBeEnabled();
  await addSongButton.click();

  await expect(page.getByText("Song added to set!")).toBeVisible();
  await expect(dialog).toBeHidden();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: config.song.name }),
  ).toBeVisible();
  await openPersistedSetFromSongHistory(page, config);
});

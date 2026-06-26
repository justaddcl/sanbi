import { TRPCError } from "@trpc/server";
import { type z } from "zod";

import { type AppLogger } from "@lib/loggers/logger";
import {
  type NewSetSectionSong,
  type SetSection,
  type SetSectionSong,
  type Song,
} from "@lib/types";
import {
  type addAndReorderSongsSchema,
  type insertSetSectionSongSchema,
  type replaceSetSectionSongSongSchema,
  type updateSetSectionSongSchema,
} from "@lib/types/zod";

export type SwapSongDirection = "up" | "down";
export type MoveSectionDirection = "previous" | "next";

export type SwapSongsPositionResult = {
  success: boolean;
  message?: string;
};

export type MoveSetSectionSongResult = {
  success: boolean;
  newSetSectionId: string;
  newPosition: number;
};

export type ReplaceSetSectionSongResult = {
  success: boolean;
  setSectionSong: string;
  replacementSong: string;
};

export type AddAndReorderSongsResult = {
  success: boolean;
  newSetSectionSongId: string;
};

export type SetSectionSongWithSetSection = SetSectionSong & {
  setSection: SetSection;
};

export type SetSectionSongDataAccess = {
  createSetSectionSong: (
    setSectionSong: NewSetSectionSong,
  ) => Promise<SetSectionSong | null>;
  deleteSetSectionSong: (
    setSectionSongId: string,
  ) => Promise<SetSectionSong | null>;
  findAdjacentSetSection: (
    setId: string,
    position: number,
  ) => Promise<SetSection | null>;
  findSetSectionById: (setSectionId: string) => Promise<SetSection | null>;
  findSetSectionSongById: (
    setSectionSongId: string,
  ) => Promise<SetSectionSongWithSetSection | null>;
  findSetSectionSongsBySetSectionId: (
    setSectionId: string,
  ) => Promise<SetSectionSong[]>;
  findSongById: (songId: string) => Promise<Song | null>;
  lockSetSectionForUpdate: (setSectionId: string) => Promise<void>;
  shiftSetSectionSongPositionsFrom: (
    setSectionId: string,
    position: number,
    offset: -1 | 1,
  ) => Promise<void>;
  updateSetSectionSong: (
    setSectionSongId: string,
    updates: Partial<
      Pick<
        SetSectionSong,
        "key" | "notes" | "position" | "setSectionId" | "songId"
      >
    >,
  ) => Promise<SetSectionSong | null>;
};

type ServiceOptions = {
  userOrganizationId: string;
  setSectionSongDataAccess: SetSectionSongDataAccess;
  logger?: AppLogger;
};

type CreateSetSectionSongOptions = ServiceOptions & {
  input: z.infer<typeof insertSetSectionSongSchema>;
};

type DeleteSetSectionSongOptions = ServiceOptions & {
  setSectionSongId: string;
};

type SwapSetSectionSongOptions = ServiceOptions & {
  setSectionSongId: string;
  direction: SwapSongDirection;
};

type MoveSetSectionSongOptions = ServiceOptions & {
  setSectionSongId: string;
  direction: MoveSectionDirection;
};

type ReplaceSetSectionSongOptions = ServiceOptions & {
  input: z.infer<typeof replaceSetSectionSongSongSchema>;
};

type UpdateSetSectionSongDetailsOptions = ServiceOptions & {
  input: z.infer<typeof updateSetSectionSongSchema>;
};

type AddAndReorderSongsOptions = ServiceOptions & {
  input: z.infer<typeof addAndReorderSongsSchema>;
};

type OrganizationScopedEntity = {
  organizationId: string;
};

const assertBelongsToOrganization = (
  { organizationId: entityOrganizationId }: OrganizationScopedEntity,
  organizationId: string,
  message: string,
) => {
  if (entityOrganizationId !== organizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message,
    });
  }
};

export const createSetSectionSongForOrganization = async ({
  input,
  userOrganizationId,
  setSectionSongDataAccess,
  logger,
}: CreateSetSectionSongOptions) => {
  const { organizationId, songId, setSectionId, key, position, notes } = input;

  if (organizationId !== userOrganizationId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Organization ID does not match authenticated user's team ID",
    });
  }

  const setSection =
    await setSectionSongDataAccess.findSetSectionById(setSectionId);

  if (!setSection) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Set section not found",
    });
  }

  await setSectionSongDataAccess.lockSetSectionForUpdate(setSectionId);

  assertBelongsToOrganization(
    setSection,
    organizationId,
    "Not authorized to update this set section",
  );

  await setSectionSongDataAccess.shiftSetSectionSongPositionsFrom(
    setSectionId,
    position,
    1,
  );

  const newSetSectionSong: NewSetSectionSong = {
    songId,
    setSectionId,
    key,
    position,
    notes,
    organizationId,
  };

  const createdSetSectionSong =
    await setSectionSongDataAccess.createSetSectionSong(newSetSectionSong);

  if (!createdSetSectionSong) {
    logger?.error?.("Could not create set section song");

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not create new setSectionSong",
    });
  }

  return [createdSetSectionSong];
};

export const deleteSetSectionSongForOrganization = async ({
  setSectionSongId,
  userOrganizationId,
  setSectionSongDataAccess,
  logger,
}: DeleteSetSectionSongOptions) => {
  const setSectionSong =
    await setSectionSongDataAccess.findSetSectionSongById(setSectionSongId);

  if (!setSectionSong) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Set section song not found",
    });
  }

  assertBelongsToOrganization(
    setSectionSong,
    userOrganizationId,
    "Not authorized to delete this set section song",
  );

  const deletedSetSectionSong =
    await setSectionSongDataAccess.deleteSetSectionSong(setSectionSongId);

  if (!deletedSetSectionSong) {
    logger?.error?.(
      `Could not delete SetSectionSong ID ${setSectionSongId}. Aborting song reorder.`,
    );

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to delete set section song ${setSectionSongId}`,
    });
  }

  await setSectionSongDataAccess.shiftSetSectionSongPositionsFrom(
    deletedSetSectionSong.setSectionId,
    deletedSetSectionSong.position + 1,
    -1,
  );

  return deletedSetSectionSong;
};

export const swapSetSectionSongPositionForOrganization = async ({
  setSectionSongId,
  direction,
  userOrganizationId,
  setSectionSongDataAccess,
  logger,
}: SwapSetSectionSongOptions): Promise<SwapSongsPositionResult> => {
  const currentSong =
    await setSectionSongDataAccess.findSetSectionSongById(setSectionSongId);

  if (!currentSong) {
    logger?.error?.(
      `[setSectionSongs/swapSongPosition/${direction}] - Song ${setSectionSongId} not found`,
    );

    return {
      success: false,
      message: "Song not found",
    };
  }

  assertBelongsToOrganization(
    currentSong,
    userOrganizationId,
    "Not authorized to reorder this set section song",
  );

  const currentSetSectionSongs =
    await setSectionSongDataAccess.findSetSectionSongsBySetSectionId(
      currentSong.setSectionId,
    );
  const maxSongPosition = Math.max(
    ...currentSetSectionSongs.map((song) => song.position),
  );

  if (
    (direction === "up" && currentSong.position === 0) ||
    (direction === "down" && currentSong.position === maxSongPosition)
  ) {
    logger?.error?.(
      `[setSectionSongs/swapSongPosition/${direction}] - Cannot swap song ${direction} from position ${currentSong.position}`,
    );

    return {
      success: false,
      message: `Cannot move ${direction} from current position`,
    };
  }

  const targetPosition =
    direction === "up" ? currentSong.position - 1 : currentSong.position + 1;
  const songToSwap = currentSetSectionSongs.find(
    (song) => song.position === targetPosition,
  );

  if (!songToSwap) {
    logger?.error?.(
      `[setSectionSongs/swapSongPosition/${direction}] - No song to swap with ${direction}`,
    );

    return {
      success: false,
      message: `No song to swap with ${direction}`,
    };
  }

  await setSectionSongDataAccess.updateSetSectionSong(setSectionSongId, {
    position: targetPosition,
  });
  await setSectionSongDataAccess.updateSetSectionSong(songToSwap.id, {
    position: currentSong.position,
  });

  return {
    success: true,
    message: `Successfully moved song ${setSectionSongId} ${direction}`,
  };
};

export const moveSetSectionSongToAdjacentSectionForOrganization = async ({
  setSectionSongId,
  direction,
  userOrganizationId,
  setSectionSongDataAccess,
  logger,
}: MoveSetSectionSongOptions): Promise<MoveSetSectionSongResult> => {
  const targetSetSectionSong =
    await setSectionSongDataAccess.findSetSectionSongById(setSectionSongId);

  if (!targetSetSectionSong) {
    logger?.error?.(
      `[setSectionSongs/moveSongToAdjacentSection/${direction}] - Could not find set section song ${setSectionSongId}`,
    );

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot find set section song",
    });
  }

  assertBelongsToOrganization(
    targetSetSectionSong,
    userOrganizationId,
    "Not authorized to move this set section song",
  );

  const targetSetSection = await setSectionSongDataAccess.findAdjacentSetSection(
    targetSetSectionSong.setSection.setId,
    targetSetSectionSong.setSection.position + (direction === "next" ? 1 : -1),
  );

  if (!targetSetSection) {
    logger?.error?.(
      `[setSectionSongs/moveSongToAdjacentSection/${direction}] - Could not find a set section ${direction} to ${targetSetSectionSong.setSectionId}`,
    );

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot find ${direction} set section`,
    });
  }

  assertBelongsToOrganization(
    targetSetSection,
    userOrganizationId,
    "Not authorized to move this set section song",
  );

  const targetSetSectionSongs =
    await setSectionSongDataAccess.findSetSectionSongsBySetSectionId(
      targetSetSection.id,
    );
  const songPositionAfterMove =
    Math.max(-1, ...targetSetSectionSongs.map((song) => song.position)) + 1;

  await setSectionSongDataAccess.shiftSetSectionSongPositionsFrom(
    targetSetSectionSong.setSectionId,
    targetSetSectionSong.position + 1,
    -1,
  );

  const movedSetSectionSong =
    await setSectionSongDataAccess.updateSetSectionSong(setSectionSongId, {
      setSectionId: targetSetSection.id,
      position: songPositionAfterMove,
    });

  if (!movedSetSectionSong) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to move set section song ${setSectionSongId}`,
    });
  }

  return {
    success: true,
    newSetSectionId: targetSetSection.id,
    newPosition: songPositionAfterMove,
  };
};

export const replaceSetSectionSongForOrganization = async ({
  input,
  userOrganizationId,
  setSectionSongDataAccess,
  logger,
}: ReplaceSetSectionSongOptions): Promise<ReplaceSetSectionSongResult> => {
  const setSectionSong =
    await setSectionSongDataAccess.findSetSectionSongById(input.setSectionSongId);

  if (!setSectionSong) {
    logger?.error?.(`could not find set section song ${input.setSectionSongId}`);

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot find the set section song",
    });
  }

  assertBelongsToOrganization(
    setSectionSong,
    userOrganizationId,
    "Not authorized to replace this song",
  );

  const replacementSong = await setSectionSongDataAccess.findSongById(
    input.replacementSongId,
  );

  if (!replacementSong) {
    logger?.error?.(`could not find song ${input.replacementSongId}`);

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot find the replacement song",
    });
  }

  if (replacementSong.organizationId !== setSectionSong.organizationId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot replace with a song from a different organization",
    });
  }

  if (setSectionSong.songId !== input.replacementSongId) {
    const updatedSetSectionSong =
      await setSectionSongDataAccess.updateSetSectionSong(
        input.setSectionSongId,
        {
          songId: input.replacementSongId,
        },
      );

    if (!updatedSetSectionSong) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to replace song ${input.setSectionSongId}`,
      });
    }
  }

  return {
    success: true,
    setSectionSong: input.setSectionSongId,
    replacementSong: input.replacementSongId,
  };
};

export const updateSetSectionSongDetailsForOrganization = async ({
  input,
  userOrganizationId,
  setSectionSongDataAccess,
  logger,
}: UpdateSetSectionSongDetailsOptions) => {
  const { id: setSectionSongId, ...requestedUpdates } = input;

  if (requestedUpdates.organizationId !== userOrganizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not authorized to update this song",
    });
  }

  const setSectionSong =
    await setSectionSongDataAccess.findSetSectionSongById(setSectionSongId);

  if (!setSectionSong) {
    logger?.error?.(`could not find set section song ${setSectionSongId}`);

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot find the set section song",
    });
  }

  assertBelongsToOrganization(
    setSectionSong,
    userOrganizationId,
    "Not authorized to update this song",
  );

  const changedUpdates: Partial<
    Pick<SetSectionSong, "key" | "notes" | "position" | "setSectionId" | "songId">
  > = {};

  if (
    requestedUpdates.key !== undefined &&
    requestedUpdates.key !== setSectionSong.key
  ) {
    changedUpdates.key = requestedUpdates.key;
  }

  if (
    requestedUpdates.notes !== undefined &&
    requestedUpdates.notes !== setSectionSong.notes
  ) {
    changedUpdates.notes = requestedUpdates.notes;
  }

  if (
    requestedUpdates.position !== undefined &&
    requestedUpdates.position !== setSectionSong.position
  ) {
    changedUpdates.position = requestedUpdates.position;
  }

  if (
    requestedUpdates.setSectionId !== undefined &&
    requestedUpdates.setSectionId !== setSectionSong.setSectionId
  ) {
    changedUpdates.setSectionId = requestedUpdates.setSectionId;
  }

  if (
    requestedUpdates.songId !== undefined &&
    requestedUpdates.songId !== setSectionSong.songId
  ) {
    changedUpdates.songId = requestedUpdates.songId;
  }

  if (Object.keys(changedUpdates).length === 0) {
    logger?.info?.("No set section song detail updates needed");
    return setSectionSong;
  }

  const updatedSetSectionSong =
    await setSectionSongDataAccess.updateSetSectionSong(
      setSectionSongId,
      changedUpdates,
    );

  if (!updatedSetSectionSong) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to update set section song ${setSectionSongId}`,
    });
  }

  return updatedSetSectionSong;
};

export const addAndReorderSongsForOrganization = async ({
  input,
  userOrganizationId,
  setSectionSongDataAccess,
  logger,
}: AddAndReorderSongsOptions): Promise<AddAndReorderSongsResult> => {
  const { setSectionId, newSong, newSongTempId, orderedSongIds } = input;

  const setSection =
    await setSectionSongDataAccess.findSetSectionById(setSectionId);

  if (!setSection) {
    logger?.error?.(`could not find set section ${setSectionId}`);

    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Cannot find the set section",
    });
  }

  assertBelongsToOrganization(
    setSection,
    userOrganizationId,
    "Not authorized to update this set section",
  );

  await setSectionSongDataAccess.lockSetSectionForUpdate(setSectionId);

  const newSongPosition = orderedSongIds.indexOf(newSongTempId);

  if (newSongPosition === -1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "New song's temporary ID not found in ordered list.",
    });
  }

  const currentSetSectionSongs =
    await setSectionSongDataAccess.findSetSectionSongsBySetSectionId(
      setSectionId,
    );
  const newSetSectionSongData: NewSetSectionSong = {
    songId: newSong.songId,
    setSectionId,
    key: newSong.key,
    position: newSongPosition,
    notes: newSong.notes ?? null,
    organizationId: userOrganizationId,
  };
  const insertedSetSectionSong =
    await setSectionSongDataAccess.createSetSectionSong(newSetSectionSongData);

  if (!insertedSetSectionSong) {
    logger?.error?.("could not create a new setSectionSong using the input", {
      newSetSectionSongData,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not create new setSectionSong",
    });
  }

  const currentPositionMap = new Map<string, number>();

  currentSetSectionSongs.forEach((song) => {
    currentPositionMap.set(song.id, song.position);
  });
  currentPositionMap.set(insertedSetSectionSong.id, newSongPosition);

  const requestedOrderedSetSectionSongIds = orderedSongIds.map((songId) =>
    songId === newSongTempId ? insertedSetSectionSong.id : songId,
  );
  const requestedOrderedSetSectionSongIdsSet = new Set(
    requestedOrderedSetSectionSongIds,
  );
  const missingCurrentSetSectionSongIds = currentSetSectionSongs
    .toSorted((firstSong, secondSong) => firstSong.position - secondSong.position)
    .map((song) => song.id)
    .filter((songId) => !requestedOrderedSetSectionSongIdsSet.has(songId));
  const finalOrderedSetSectionSongIds = [
    ...requestedOrderedSetSectionSongIds,
    ...missingCurrentSetSectionSongIds,
  ];

  await Promise.all(
    finalOrderedSetSectionSongIds.map(async (setSectionSongId, position) => {
      const currentPosition = currentPositionMap.get(setSectionSongId);

      if (currentPosition === position) {
        return;
      }

      await setSectionSongDataAccess.updateSetSectionSong(setSectionSongId, {
        position,
      });
    }),
  );

  return {
    success: true,
    newSetSectionSongId: insertedSetSectionSong.id,
  };
};

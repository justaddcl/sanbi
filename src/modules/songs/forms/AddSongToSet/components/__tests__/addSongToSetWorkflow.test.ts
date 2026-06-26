import { createSetFixture } from "@testUtils/fixtures/sets";
import { createSongFixture } from "@testUtils/fixtures/songs";
import { createUuid } from "@testUtils/generators/createUuid";

import {
  AddSongToSetDialogStep,
  addSongToSetWorkflowReducer,
  getAddSongToSetInvalidStepRecovery,
  getAddSongToSetReviewInput,
  initialAddSongToSetWorkflowState,
} from "../addSongToSetWorkflow";

describe("addSongToSetWorkflow", () => {
  it("models normal step progression and preserves review input", () => {
    const set = createSetFixture();
    const selectedSet = {
      id: set.id,
      songCount: 2,
    };
    const sectionId = createUuid();
    const songKey = "c";
    const song = createSongFixture({ preferredKey: songKey });
    const existingSongId = createUuid();
    const orderedSongIds = [existingSongId, song.id];

    const selectedSetState = addSongToSetWorkflowReducer(
      initialAddSongToSetWorkflowState,
      {
        type: "selectSet",
        selectedSet,
      },
    );
    const selectedSectionState = addSongToSetWorkflowReducer(selectedSetState, {
      type: "selectSetSection",
      setSectionId: sectionId,
      setSectionSongCount: 1,
    });
    const positionedSongState = addSongToSetWorkflowReducer(
      selectedSectionState,
      {
        type: "setSongPosition",
        songId: song.id,
        orderedSongIds,
      },
    );
    const reviewState = addSongToSetWorkflowReducer(positionedSongState, {
      type: "selectKey",
      selectedKey: songKey,
    });

    expect(reviewState.currentStep).toBe(AddSongToSetDialogStep.REVIEW);
    expect(getAddSongToSetInvalidStepRecovery(reviewState)).toBeNull();
    expect(getAddSongToSetReviewInput(reviewState)).toEqual({
      selectedSetId: selectedSet.id,
      selectedSetSection: sectionId,
      orderedSongIds,
      songKey,
    });
  });

  it("recovers invalid steps to the first missing prerequisite", () => {
    const selectedSet = {
      id: createUuid(),
      songCount: 0,
    };
    const selectedSetSection = createUuid();
    const orderedSongIds = [createUuid()];

    expect(
      getAddSongToSetInvalidStepRecovery({
        ...initialAddSongToSetWorkflowState,
        currentStep: AddSongToSetDialogStep.REVIEW,
      }),
    ).toBe(AddSongToSetDialogStep.SELECT_SET);

    expect(
      getAddSongToSetInvalidStepRecovery({
        ...initialAddSongToSetWorkflowState,
        currentStep: AddSongToSetDialogStep.REVIEW,
        selectedSet,
      }),
    ).toBe(AddSongToSetDialogStep.SELECT_SET_SECTION);

    expect(
      getAddSongToSetInvalidStepRecovery({
        ...initialAddSongToSetWorkflowState,
        currentStep: AddSongToSetDialogStep.REVIEW,
        selectedSet,
        selectedSetSection,
      }),
    ).toBe(AddSongToSetDialogStep.SET_POSITION);

    expect(
      getAddSongToSetInvalidStepRecovery({
        ...initialAddSongToSetWorkflowState,
        currentStep: AddSongToSetDialogStep.REVIEW,
        selectedSet,
        selectedSetSection,
        updatedSetSectionOrderedSongIds: orderedSongIds,
      }),
    ).toBe(AddSongToSetDialogStep.SET_KEY);
  });
});

import { type SongKey } from "@lib/constants";
import { type SetType } from "@lib/types";

export type SelectedSet = Pick<SetType, "id"> & {
  songCount: number;
};

export enum AddSongToSetDialogStep {
  SELECT_SET = 1,
  SELECT_SET_SECTION = 2,
  SET_POSITION = 3,
  SET_KEY = 4,
  REVIEW = 5,
}

export type AddSongToSetWorkflowState = {
  currentStep: AddSongToSetDialogStep;
  isCreatingNewSet: boolean;
  selectedSet: SelectedSet | null;
  selectedSetSection: string | null;
  initialSongPosition: number;
  songPosition: number | null;
  updatedSetSectionOrderedSongIds: string[];
  selectedKey: SongKey | null;
};

export type AddSongToSetReviewInput = {
  selectedSetId: string;
  selectedSetSection: string;
  orderedSongIds: string[];
  songKey: SongKey;
};

export type AddSongToSetWorkflowAction =
  | { type: "startCreatingNewSet" }
  | { type: "selectSet"; selectedSet: SelectedSet }
  | {
      type: "selectSetSection";
      setSectionId: string;
      setSectionSongCount: number;
    }
  | { type: "setSongPosition"; songId: string; orderedSongIds: string[] }
  | { type: "selectKey"; selectedKey: SongKey }
  | { type: "goBack" }
  | { type: "reset" }
  | { type: "recoverInvalidStep"; step: AddSongToSetDialogStep };

export const initialAddSongToSetWorkflowState: AddSongToSetWorkflowState = {
  currentStep: AddSongToSetDialogStep.SELECT_SET,
  isCreatingNewSet: false,
  selectedSet: null,
  selectedSetSection: null,
  initialSongPosition: 0,
  songPosition: null,
  updatedSetSectionOrderedSongIds: [],
  selectedKey: null,
};

export const getAddSongToSetReviewInput = (
  state: AddSongToSetWorkflowState,
): AddSongToSetReviewInput | null => {
  if (
    !state.selectedSet ||
    !state.selectedSetSection ||
    state.updatedSetSectionOrderedSongIds.length === 0 ||
    !state.selectedKey
  ) {
    return null;
  }

  return {
    selectedSetId: state.selectedSet.id,
    selectedSetSection: state.selectedSetSection,
    orderedSongIds: state.updatedSetSectionOrderedSongIds,
    songKey: state.selectedKey,
  };
};

export const getAddSongToSetInvalidStepRecovery = (
  state: AddSongToSetWorkflowState,
): AddSongToSetDialogStep | null => {
  if (
    state.currentStep >= AddSongToSetDialogStep.SELECT_SET_SECTION &&
    !state.selectedSet
  ) {
    return AddSongToSetDialogStep.SELECT_SET;
  }

  if (
    state.currentStep >= AddSongToSetDialogStep.SET_POSITION &&
    !state.selectedSetSection
  ) {
    return AddSongToSetDialogStep.SELECT_SET_SECTION;
  }

  if (
    state.currentStep >= AddSongToSetDialogStep.SET_KEY &&
    state.updatedSetSectionOrderedSongIds.length === 0
  ) {
    return AddSongToSetDialogStep.SET_POSITION;
  }

  if (
    state.currentStep >= AddSongToSetDialogStep.REVIEW &&
    !state.selectedKey
  ) {
    return AddSongToSetDialogStep.SET_KEY;
  }

  return null;
};

export const addSongToSetWorkflowReducer = (
  state: AddSongToSetWorkflowState,
  action: AddSongToSetWorkflowAction,
): AddSongToSetWorkflowState => {
  switch (action.type) {
    case "startCreatingNewSet":
      return {
        ...state,
        isCreatingNewSet: true,
      };
    case "selectSet":
      return {
        ...initialAddSongToSetWorkflowState,
        currentStep: AddSongToSetDialogStep.SELECT_SET_SECTION,
        selectedSet: action.selectedSet,
      };
    case "selectSetSection":
      return {
        ...state,
        currentStep: AddSongToSetDialogStep.SET_POSITION,
        selectedSetSection: action.setSectionId,
        initialSongPosition: action.setSectionSongCount,
        songPosition: null,
        updatedSetSectionOrderedSongIds: [],
        selectedKey: null,
      };
    case "setSongPosition":
      return {
        ...state,
        currentStep: AddSongToSetDialogStep.SET_KEY,
        songPosition: action.orderedSongIds.findIndex(
          (songId) => songId === action.songId,
        ),
        updatedSetSectionOrderedSongIds: action.orderedSongIds,
        selectedKey: null,
      };
    case "selectKey":
      return {
        ...state,
        currentStep: AddSongToSetDialogStep.REVIEW,
        selectedKey: action.selectedKey,
      };
    case "goBack":
      if (
        state.currentStep === AddSongToSetDialogStep.SELECT_SET &&
        state.isCreatingNewSet
      ) {
        return {
          ...state,
          isCreatingNewSet: false,
        };
      }

      if (state.currentStep > AddSongToSetDialogStep.SELECT_SET) {
        return {
          ...state,
          currentStep: state.currentStep - 1,
          songPosition:
            state.currentStep === AddSongToSetDialogStep.SET_POSITION
              ? null
              : state.songPosition,
        };
      }

      return initialAddSongToSetWorkflowState;
    case "reset":
      return initialAddSongToSetWorkflowState;
    case "recoverInvalidStep":
      return {
        ...state,
        currentStep: action.step,
      };
  }
};

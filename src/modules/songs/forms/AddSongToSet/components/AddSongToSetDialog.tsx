"use client";
import React, { useEffect, useReducer, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { type inferProcedureOutput } from "@trpc/server";

import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@components/ui/dialog";
import {
  AddSongToSetDialogHeader,
  ReviewStep,
  SetSelectionStep,
  SetSongKeyStep,
} from "@modules/songs/forms/AddSongToSet/components";
import { type AppRouter } from "@server/api/root";

import {
  AddSongToSetDialogStep,
  addSongToSetWorkflowReducer,
  getAddSongToSetInvalidStepRecovery,
  getAddSongToSetReviewInput,
  initialAddSongToSetWorkflowState,
} from "./addSongToSetWorkflow";
import { SetSectionSelectionStep } from "./SetSectionSelectionStep";
import { SetSongPositionStep } from "./SetSongPositionStep";

const contentMap: Record<
  AddSongToSetDialogStep,
  {
    title: string;
    alternateTitle?: string;
  }
> = {
  [AddSongToSetDialogStep.SELECT_SET]: {
    title: "Add to which set?",
    alternateTitle: "Create new set",
  },
  [AddSongToSetDialogStep.SELECT_SET_SECTION]: {
    title: "Which section?",
  },
  [AddSongToSetDialogStep.SET_POSITION]: {
    title: "When will you play it?",
  },
  [AddSongToSetDialogStep.SET_KEY]: {
    title: "What key will you play in?",
  },
  [AddSongToSetDialogStep.REVIEW]: {
    title: "Review",
  },
};

export type AddSongToSetDialogSong = Pick<
  inferProcedureOutput<AppRouter["song"]["get"]>,
  "id" | "name" | "preferredKey"
>;

type AddSongToSetDialogProps = {
  song: AddSongToSetDialogSong;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode | null;
};

export const AddSongToSetDialog: React.FC<AddSongToSetDialogProps> = ({
  song,
  open,
  onOpenChange,
  trigger,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [workflowState, dispatchWorkflowAction] = useReducer(
    addSongToSetWorkflowReducer,
    initialAddSongToSetWorkflowState,
  );

  const totalSteps = Object.keys(AddSongToSetDialogStep).length;
  const isOpen = open ?? uncontrolledOpen;
  const {
    currentStep,
    isCreatingNewSet,
    selectedSet,
    selectedSetSection,
    initialSongPosition,
    songPosition,
  } = workflowState;
  const invalidStepRecovery =
    getAddSongToSetInvalidStepRecovery(workflowState);
  const reviewInput = getAddSongToSetReviewInput(workflowState);
  const displayedStep = invalidStepRecovery ?? currentStep;

  useEffect(() => {
    if (!invalidStepRecovery) {
      return;
    }

    dispatchWorkflowAction({
      type: "recoverInvalidStep",
      step: invalidStepRecovery,
    });
  }, [invalidStepRecovery]);

  const setDialogOpen = (nextOpen: boolean) => {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  const goBack = () => {
    if (
      currentStep === AddSongToSetDialogStep.SELECT_SET &&
      !isCreatingNewSet
    ) {
      resetDialog();
      return;
    }

    dispatchWorkflowAction({ type: "goBack" });
  };

  const resetDialog = (nextOpen = false) => {
    setDialogOpen(nextOpen);
    dispatchWorkflowAction({ type: "reset" });
  };

  const renderStepContent = () => {
    switch (displayedStep) {
      case AddSongToSetDialogStep.SELECT_SET:
        return (
          <SetSelectionStep
            isCreatingNewSet={isCreatingNewSet}
            onCreateSetClick={() => {
              dispatchWorkflowAction({ type: "startCreatingNewSet" });
            }}
            onSetSelect={(selectedSetSummary) => {
              dispatchWorkflowAction({
                type: "selectSet",
                selectedSet: selectedSetSummary,
              });
            }}
          />
        );
      case AddSongToSetDialogStep.SELECT_SET_SECTION:
        return (
          <SetSectionSelectionStep
            selectedSet={selectedSet}
            onSelectSetSection={(setSectionId, setSectionSongCount) => {
              dispatchWorkflowAction({
                type: "selectSetSection",
                setSectionId,
                setSectionSongCount,
              });
            }}
          />
        );
      case AddSongToSetDialogStep.SET_POSITION:
        return (
          <SetSongPositionStep
            selectedSetSection={selectedSetSection}
            song={song}
            newSongInitialPosition={songPosition ?? initialSongPosition}
            onSongPositionSet={(orderedSongIds) => {
              dispatchWorkflowAction({
                type: "setSongPosition",
                songId: song.id,
                orderedSongIds,
              });
            }}
          />
        );
      case AddSongToSetDialogStep.SET_KEY:
        return (
          <SetSongKeyStep
            songId={song.id}
            preferredKey={song.preferredKey}
            onKeySelect={(selectedKey) => {
              dispatchWorkflowAction({ type: "selectKey", selectedKey });
            }}
          />
        );
      case AddSongToSetDialogStep.REVIEW:
        if (!reviewInput) {
          return null;
        }

        return (
          <ReviewStep
            selectedSetId={reviewInput.selectedSetId}
            selectedSetSection={reviewInput.selectedSetSection}
            song={song}
            orderedSongIds={reviewInput.orderedSongIds}
            songKey={reviewInput.songKey}
            onAddSong={() => {
              resetDialog();
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetDialog();
          return;
        }

        setDialogOpen(true);
      }}
    >
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              <Plus /> Add to a set
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent
        fixed
        minimalPadding
        closeButton={null}
        className="max-h-[90%] gap-0 overflow-y-auto p-0 lg:max-h-[75%] lg:p-0"
      >
        <AddSongToSetDialogHeader
          title={
            displayedStep === AddSongToSetDialogStep.SELECT_SET &&
            isCreatingNewSet
              ? (contentMap[AddSongToSetDialogStep.SELECT_SET].alternateTitle ??
                "Create new set")
              : contentMap[displayedStep].title
          }
          step={displayedStep}
          totalSteps={totalSteps}
          onBack={goBack}
          onClose={resetDialog}
          isCreatingNewSet={isCreatingNewSet}
        />
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

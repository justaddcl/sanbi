"use client";
import React, { useState } from "react";
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
import { type SongKey } from "@lib/constants";
import { type SetType } from "@lib/types";
import { type AppRouter } from "@server/api/root";

import { SetSectionSelectionStep } from "./SetSectionSelectionStep";
import { SetSongPositionStep } from "./SetSongPositionStep";

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

type AddSongToSetDialogProps = {
  song: inferProcedureOutput<AppRouter["song"]["get"]>;
};

export const AddSongToSetDialog: React.FC<AddSongToSetDialogProps> = ({
  song,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(
    AddSongToSetDialogStep.SELECT_SET,
  );
  const [isCreatingNewSet, setIsCreatingNewSet] = useState(false);
  const [selectedSet, setSelectedSet] = useState<SelectedSet | null>(null);

  const [selectedSetSection, setSelectedSetSection] = useState<string | null>(
    null,
  );

  const [initialSongPosition, setInitialSongPosition] = useState(0);
  const [songPosition, setSongPosition] = useState<number | null>(null);
  const [updatedSetSectionOrderedSongIds, setUpdatedSetSectionOrderedSongIds] =
    useState<string[]>([]);

  const [selectedKey, setSelectedKey] = useState<SongKey | null>(null);

  const totalSteps = Object.keys(AddSongToSetDialogStep).length / 2; // this is divided by 2 since the length property combines the number of keys and values

  const goBack = () => {
    if (currentStep === AddSongToSetDialogStep.SELECT_SET && isCreatingNewSet) {
      setIsCreatingNewSet(false);
    } else if (currentStep > AddSongToSetDialogStep.SELECT_SET) {
      setCurrentStep((step) => step - 1);

      // reset selected song position if user goes back from the set position step
      if (currentStep === AddSongToSetDialogStep.SET_POSITION) {
        setSongPosition(null);
      }
    } else {
      resetDialog();
    }
  };

  const resetDialog = () => {
    setIsOpen(false);
    setIsCreatingNewSet(false);
    setCurrentStep(AddSongToSetDialogStep.SELECT_SET);
    setSelectedSet(null);
    setSelectedSetSection(null);
    setInitialSongPosition(0);
    setSongPosition(null);
    setSelectedKey(null);
    setUpdatedSetSectionOrderedSongIds([]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case AddSongToSetDialogStep.SELECT_SET:
        return (
          <SetSelectionStep
            isCreatingNewSet={isCreatingNewSet}
            onCreateSetClick={() => {
              setIsCreatingNewSet(true);
            }}
            onSetSelect={(selectedSetSummary) => {
              setSelectedSet(selectedSetSummary);
              setCurrentStep(AddSongToSetDialogStep.SELECT_SET_SECTION);
            }}
          />
        );
      case AddSongToSetDialogStep.SELECT_SET_SECTION:
        return (
          <SetSectionSelectionStep
            selectedSet={selectedSet}
            onSelectSetSection={(setSectionId, setSectionSongCount) => {
              setSelectedSetSection(setSectionId);
              setCurrentStep(AddSongToSetDialogStep.SET_POSITION);
              setInitialSongPosition(setSectionSongCount);
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
              const songPosition = orderedSongIds.findIndex(
                (songId) => songId === song.id,
              );
              setSongPosition(songPosition);
              setUpdatedSetSectionOrderedSongIds(orderedSongIds);
              setCurrentStep(AddSongToSetDialogStep.SET_KEY);
            }}
          />
        );
      case AddSongToSetDialogStep.SET_KEY:
        return (
          <SetSongKeyStep
            songId={song.id}
            preferredKey={song.preferredKey!} // TODO: can we drop this non-null assertion?
            onKeySelect={(selectedKey) => {
              setSelectedKey(selectedKey);
              setCurrentStep(AddSongToSetDialogStep.REVIEW);
            }}
          />
        );
      case AddSongToSetDialogStep.REVIEW:
        if (!selectedSet) {
          setCurrentStep(AddSongToSetDialogStep.SELECT_SET);
          return null;
        }

        if (!selectedSetSection) {
          setCurrentStep(AddSongToSetDialogStep.SELECT_SET_SECTION);
          return null;
        }

        if (
          !updatedSetSectionOrderedSongIds ||
          updatedSetSectionOrderedSongIds.length === 0
        ) {
          setCurrentStep(AddSongToSetDialogStep.SET_POSITION);
          return null;
        }

        if (!selectedKey) {
          setCurrentStep(AddSongToSetDialogStep.SET_KEY);
          return null;
        }

        return (
          <ReviewStep
            selectedSetId={selectedSet.id}
            selectedSetSection={selectedSetSection}
            song={song}
            orderedSongIds={updatedSetSectionOrderedSongIds}
            songKey={selectedKey}
            onAddSong={() => {
              setIsOpen(false);
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
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetDialog();
        }
      }}
    >
      <DialogTrigger>
        <Button>
          <Plus /> Add to a set
        </Button>
      </DialogTrigger>
      <DialogContent
        fixed
        minimalPadding
        closeButton={null}
        className="max-h-[90%] gap-0 overflow-y-auto p-0 lg:max-h-[75%] lg:p-0"
      >
        <AddSongToSetDialogHeader
          title={
            currentStep === AddSongToSetDialogStep.SELECT_SET &&
            isCreatingNewSet
              ? contentMap[AddSongToSetDialogStep.SELECT_SET].alternateTitle ??
                "Create new set"
              : contentMap[currentStep].title
          }
          step={currentStep}
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

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
import { type SetType } from "@lib/types";
import { type AppRouter } from "@server/api/root";

import { SetSectionSelectionStep } from "./SetSectionSelectionStep";
import { SetSongPositionStep } from "./SetSongPositionStep";
import { SongKey } from "@lib/constants";

export type SelectedSet = Pick<SetType, "id"> & {
  // TODO: return this directly from the set/get route
  songCount: number;
};

export enum AddSongToSetDialogStep {
  SELECT_SET = 1,
  SELECT_SET_SECTION = 2,
  SET_POSITION = 3,
  SET_KEY = 4,
  ADD_NOTES = 5,
}

const contentMap: Record<
  AddSongToSetDialogStep,
  {
    title: string;
    alternateTitle?: string;
    subtitle?: (songName: string) => string;
  }
> = {
  [AddSongToSetDialogStep.SELECT_SET]: {
    title: "Add to which set?",
    alternateTitle: "Create new set",
    subtitle: (songName: string) =>
      `Select the set you want to add ${songName} to`,
  },
  [AddSongToSetDialogStep.SELECT_SET_SECTION]: {
    title: "Which section?",
    subtitle: (songName: string) =>
      `Select the set section to add ${songName} to`,
  },
  [AddSongToSetDialogStep.SET_POSITION]: {
    title: "When will you play it?",
    subtitle: (songName: string) => `Set when you'll play ${songName}`,
  },
  [AddSongToSetDialogStep.SET_KEY]: {
    title: "What key will you play in?",
  },
  [AddSongToSetDialogStep.ADD_NOTES]: {
    title: "Add notes",
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
  const [selectedKey, setSelectedKey] = useState<SongKey | null>(null);

  const totalSteps = Object.values(AddSongToSetDialogStep).filter(
    (value) => typeof value === "number",
  ).length;

  const goBack = () => {
    if (currentStep === AddSongToSetDialogStep.SELECT_SET && isCreatingNewSet) {
      setIsCreatingNewSet(false);
    } else if (currentStep > AddSongToSetDialogStep.SELECT_SET) {
      setCurrentStep(currentStep - 1);
      // setCurrentStep((step) => step - 1);
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
            newSongInitialPosition={
              songPosition !== null ? songPosition : initialSongPosition
            }
            onSongPositionSet={(songPosition) => {
              setSongPosition(songPosition);
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
              setCurrentStep(AddSongToSetDialogStep.ADD_NOTES);
            }}
          />
        );
      case AddSongToSetDialogStep.ADD_NOTES:
        return <ReviewStep />;
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
        className="max-h-[90%] gap-0 overflow-y-auto p-0 lg:max-h-[65%] lg:p-0"
      >
        {/* TODO: move within each step's component */}
        <AddSongToSetDialogHeader
          title={
            currentStep === AddSongToSetDialogStep.SELECT_SET &&
            isCreatingNewSet
              ? contentMap[AddSongToSetDialogStep.SELECT_SET].alternateTitle! // using a non-null type assertion since we know this specific alternateTitle shouldn't be undefined
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

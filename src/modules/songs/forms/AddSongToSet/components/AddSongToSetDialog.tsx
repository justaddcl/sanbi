"use client";
import React, { useState } from "react";
import { Plus } from "@phosphor-icons/react";

import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@components/ui/dialog";
import {
  AddSongToSetDialogHeader,
  SetSelectionStep,
} from "@modules/songs/forms/AddSongToSet/components";

export enum AddSongToSetDialogStep {
  SELECT_SET = 1,
  SELECT_SET_SECTION = 2,
  SET_POSITION = 3,
  SET_KEY = 4,
  ADD_NOTES = 5,
}

const contentMap: Record<
  AddSongToSetDialogStep,
  { title: string; subtitle?: (songName: string) => string }
> = {
  [AddSongToSetDialogStep.SELECT_SET]: {
    title: "Add to which set?",
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

type AddSongToSetDialogProps = {};

export const AddSongToSetDialog: React.FC = ({}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(
    AddSongToSetDialogStep.SELECT_SET,
  );

  const totalSteps = Object.values(AddSongToSetDialogStep).filter(
    (value) => typeof value === "number",
  ).length;

  const goBack = () => {
    if (currentStep > AddSongToSetDialogStep.SELECT_SET) {
      setCurrentStep(currentStep - 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(AddSongToSetDialogStep.SELECT_SET);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button>
          <Plus /> Add to a set
        </Button>
      </DialogTrigger>
      <DialogContent
        fixed
        minimalPadding
        closeButton={null}
        className="gap-0 p-0 lg:p-0"
      >
        {/* TODO: move within each step's component */}
        <AddSongToSetDialogHeader
          title={contentMap[currentStep].title}
          step={currentStep}
          totalSteps={totalSteps}
          onBack={goBack}
          onClose={handleClose}
        />
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

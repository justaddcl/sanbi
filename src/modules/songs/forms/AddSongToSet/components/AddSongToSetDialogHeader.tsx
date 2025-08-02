"use client";

import { CaretLeft, X } from "@phosphor-icons/react";

import { Button } from "@components/ui/button";
import { DialogClose } from "@components/ui/dialog";
import { Progress } from "@components/ui/progress";
import { HStack } from "@components/HStack";
import { VStack } from "@components/VStack";
import { cn } from "@lib/utils";

import { AddSongToSetDialogStep } from ".";

interface AddSongToSetDialogHeaderProps {
  title: string;
  step: AddSongToSetDialogStep;
  totalSteps: number;
  onBack: () => void;
  onClose: () => void;
  isCreatingNewSet: boolean;
}

export const AddSongToSetDialogHeader: React.FC<
  AddSongToSetDialogHeaderProps
> = ({ title, step, totalSteps, onBack, onClose, isCreatingNewSet }) => {
  const progressValue = (step / totalSteps) * 100;
  return (
    <VStack className="gap-2 p-4 pb-2 lg:p-6 lg:py-4">
      <HStack className="mx-[-10px] items-center justify-between">
        <HStack className="items-center">
          {!(
            step === AddSongToSetDialogStep.SELECT_SET && !isCreatingNewSet
          ) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Go back"
              className="mr-2"
            >
              <CaretLeft weight="bold" className="h-5 w-5" />
            </Button>
          )}
          <h2
            id="modal-title"
            className={cn("text-lg font-semibold", {
              "ml-3":
                step === AddSongToSetDialogStep.SELECT_SET && !isCreatingNewSet,
            })}
          >
            {title}
          </h2>
        </HStack>
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X weight="bold" className="h-5 w-5" />
          </Button>
        </DialogClose>
      </HStack>

      <HStack className="items-center">
        <Progress
          className="h-2 transition-all duration-300 ease-out"
          value={progressValue}
        />
        <div className="ml-3 text-sm text-gray-500">
          {step}/{totalSteps}
        </div>
      </HStack>
    </VStack>
  );
};

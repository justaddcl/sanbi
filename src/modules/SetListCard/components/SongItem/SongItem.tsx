"use client";

import { HStack } from "@components/HStack";
import { SongActionMenu } from "../SongActionMenu/SongActionMenu";
import { type SetSectionSongWithSongData } from "@lib/types";
import { type SetSectionCardProps } from "@modules/sets/components/SetSectionCard";
import { SongContent } from "@modules/SetListCard/components/SongContent";
import { useState } from "react";
import { VStack } from "@components/VStack";
import { Button } from "@components/ui/button";
import { insertSetSectionSongSchema } from "@lib/types/zod";
import { type z } from "zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@components/ui/form";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useUserQuery } from "@modules/users/api/queries";
import { cn } from "@lib/utils";

type BaseSongItemProps = {
  /** set section song object */
  setSectionSong: SetSectionSongWithSongData;

  /** ID of the set this set section song is attached to  */
  setId: string;

  /** index of song in the set list */
  index: number;

  /** the type of set section this song is attached to */
  setSectionType: string;

  /** should the song item show the action menu? */
  withActionsMenu?: boolean;

  /** should this be displayed more compact? */
  small?: boolean;
};

export type SongItemWithActionsMenuProps = BaseSongItemProps & {
  withActionsMenu: true;

  /** is this song in the first section of the set? */
  isInFirstSection: boolean;

  /** is this song in the last section of the set? */
  isInLastSection: boolean;

  /** is this song the first song of the section? */
  isFirstSong: boolean;

  /** is this song the last song of the section? */
  isLastSong: boolean;
};

type SongItemWithoutActionsMenuProps = BaseSongItemProps & {
  withActionsMenu?: false;
};

const updateSetSectionSongsSchema = insertSetSectionSongSchema.pick({
  key: true,
  notes: true,
});

export type UpdateSetSectionSongFormFields = Omit<
  z.infer<typeof updateSetSectionSongsSchema>,
  "notes"
> & {
  notes: NonNullable<z.infer<typeof updateSetSectionSongsSchema>["notes"]>;
};

export type SongItemProps =
  | SongItemWithActionsMenuProps
  | SongItemWithoutActionsMenuProps;

export const SongItem: React.FC<SongItemProps> = ({
  setSectionSong,
  setId,
  index,
  setSectionType,
  small,
  ...props
}) => {
  const [isEditingDetails, setIsEditingDetails] = useState<boolean>(false);

  const apiUtils = api.useUtils();
  const updateSetSectionSongMutation =
    api.setSectionSong.updateDetails.useMutation();

  const updateSetSectionSongForm = useForm<UpdateSetSectionSongFormFields>({
    resolver: zodResolver(updateSetSectionSongsSchema),
    defaultValues: {
      key: setSectionSong.key,
      notes: setSectionSong.notes ?? "",
    },
  });

  const {
    formState: { isDirty, isSubmitting, isValid },
    reset: resetForm,
  } = updateSetSectionSongForm;

  const {
    data: userData,
    error: userQueryError,
    isLoading: userQueryLoading,
    isAuthLoaded,
  } = useUserQuery();
  const userMembership = userData?.memberships[0];

  const shouldUpdateSongButtonBeDisabled =
    !isDirty ||
    !isValid ||
    isSubmitting ||
    updateSetSectionSongMutation.isPending;

  if (!!userQueryError || !isAuthLoaded || !userData || !userMembership) {
    return null;
  }

  const handleUpdateSetSectionSong: SubmitHandler<
    UpdateSetSectionSongFormFields
  > = async (formValues: UpdateSetSectionSongFormFields) => {
    toast.loading("Updating song...");

    updateSetSectionSongMutation.mutate(
      {
        id: setSectionSong.id,
        organizationId: userMembership.organizationId,
        ...formValues,
      },
      {
        async onSuccess() {
          toast.dismiss();
          toast.success("Updated song");
          await apiUtils.set.get.invalidate({
            setId,
            organizationId: userMembership.organizationId,
          });
        },

        async onError(updateError) {
          toast.dismiss();
          toast.error(`Could not update song: ${updateError.message}`);
        },
      },
    );

    setIsEditingDetails(false);
  };

  return (
    <Form {...updateSetSectionSongForm}>
      <form
        onSubmit={updateSetSectionSongForm.handleSubmit(
          handleUpdateSetSectionSong,
        )}
      >
        <VStack
          className={cn(
            "gap-4 rounded-lg",
            [small && "p-1"],
            [!small && "px-4 py-3"],
            [isEditingDetails && "border border-slate-200 bg-slate-50 p-6"],
            [!isEditingDetails && "p-4 hover:bg-slate-50"],
          )}
        >
          <HStack className="items-baseline justify-between">
            <SongContent
              setSectionSong={setSectionSong}
              index={index}
              isEditing={isEditingDetails}
              updateForm={updateSetSectionSongForm}
            />
            {props.withActionsMenu && !isEditingDetails && (
              <SongActionMenu
                setSectionSong={setSectionSong}
                setId={setId}
                setSectionType={setSectionType}
                isFirstSong={props.isFirstSong}
                isLastSong={props.isLastSong}
                isInFirstSection={props.isInFirstSection}
                isInLastSection={props.isInLastSection}
                setIsEditingDetails={setIsEditingDetails}
              />
            )}
          </HStack>
          {isEditingDetails && (
            <HStack className="justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditingDetails(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={shouldUpdateSongButtonBeDisabled}
                isLoading={isSubmitting}
              >
                Save
              </Button>
            </HStack>
          )}
        </VStack>
      </form>
    </Form>
  );
};

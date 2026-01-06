"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "@components/ui/button";
import { Form } from "@components/ui/form";
import { HStack } from "@components/HStack";
import { VStack } from "@components/VStack";
import { SongContent } from "@modules/SetListCard/components/SongContent";
import { EditSongContentFormFields } from "@modules/SetListCard/forms/EditSongContent/components";
import { useUserQuery } from "@modules/users/api/queries";
import { type SetSectionSongWithSongData } from "@lib/types";
import { insertSetSectionSongSchema } from "@lib/types/zod";
import { cn } from "@lib/utils";
import { api } from "@/trpc/react";

import { SongActionMenu } from "../SongActionMenu/SongActionMenu";

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

export type UpdateSetSectionSongFormFields = z.infer<
  typeof updateSetSectionSongsSchema
>;

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

  const updateSetSectionSongForm = useForm({
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

  const handleUpdateSetSectionSong = async (
    formValues: UpdateSetSectionSongFormFields,
  ) => {
    toast.loading("Updating song...");

    updateSetSectionSongMutation.mutate(
      {
        id: setSectionSong.id,
        organizationId: userMembership.organizationId,
        ...formValues,
        notes: formValues.notes ?? null,
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
            [small && "pl-1"],
            [!small && "pl-2 md:px-4"],
            [
              isEditingDetails &&
                "mt-4 border border-slate-200 bg-slate-50 p-4 lg:p-6",
            ],
            [!isEditingDetails && "hover:bg-slate-50 md:px-4"],
          )}
        >
          <HStack className="items-baseline justify-between">
            {isEditingDetails ? (
              <EditSongContentFormFields
                setSectionSong={setSectionSong}
                index={index}
                updateForm={updateSetSectionSongForm}
              />
            ) : (
              <SongContent
                songKey={setSectionSong.key}
                name={setSectionSong.song.name}
                notes={setSectionSong.notes}
                index={index}
              />
            )}
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

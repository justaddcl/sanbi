import { PageTitle } from "@components/PageTitle";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@components/ResponsiveDialog";
import { Badge } from "@components/ui/badge";
import { formatDate } from "@lib/date/formatDate";
import { pluralize } from "@lib/string/pluralize";
import { type SetWithSectionsSongsAndEventType } from "@lib/types";
import {
  EditSetDetailsForm,
  type EditSetDetailsFormProps,
} from "@modules/sets/components/forms/EditSetDetailsForm";
import { Archive } from "@phosphor-icons/react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

type SetDetailsProps = {
  set: SetWithSectionsSongsAndEventType;
  isEditing: boolean;
  setIsEditing: EditSetDetailsFormProps["setIsEditing"];
};

export const SetDetails: React.FC<SetDetailsProps> = ({
  set,
  isEditing,
  setIsEditing,
}) => {
  const songCount =
    set.sections.reduce((total, section) => total + section.songs.length, 0) ??
    0;

  return (
    <>
      <PageTitle
        title={formatDate(set.date, { month: "long" })}
        subtitle={set.eventType.name}
        details={`${songCount} ${pluralize(songCount, { singular: "song", plural: "songs" })}`}
        badge={
          set.isArchived ? (
            <Badge variant="warn" className="gap-1">
              <Archive />
              Archived
            </Badge>
          ) : undefined
        }
      />
      <ResponsiveDialog open={isEditing} onOpenChange={setIsEditing}>
        <ResponsiveDialogContent className="mx-6 gap-2 p-6 lg:gap-6 lg:p-8">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Edit set details</ResponsiveDialogTitle>
            <VisuallyHidden.Root>
              <ResponsiveDialogDescription>
                Edit set details
              </ResponsiveDialogDescription>
            </VisuallyHidden.Root>
          </ResponsiveDialogHeader>
          <EditSetDetailsForm set={set} setIsEditing={setIsEditing} />
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
};

import { HStack } from "@components/HStack";
import { SongKey } from "@components/SongKey";
import { Text } from "@components/Text";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import { VStack } from "@components/VStack";
import { songKeys } from "@lib/constants";
import { formatSongKey } from "@lib/string/formatSongKey";
import { type SetSectionSongWithSongData } from "@lib/types";
import { cn } from "@lib/utils";
import { type UseFormReturn } from "react-hook-form";
import unescapeHTML from "validator/es/lib/unescape";
import { type UpdateSetSectionSongFormFields } from "../SongItem";

export type SongContentProps = {
  /** The set section song object containing song details and metadata */
  setSectionSong: SetSectionSongWithSongData;

  /** The 1-based index position of this song in the overall set list */
  index: number;

  /** is the song item in edit mode */
  isEditing: boolean;

  /** react hook form for updating set section song */
  updateForm: UseFormReturn<UpdateSetSectionSongFormFields>;
};

/**
 * Displays the core content of a song item including index number, key, title and notes
 * Used as an internal component within SongItem
 */
export const SongContent: React.FC<SongContentProps> = ({
  setSectionSong,
  index,
  isEditing,
  updateForm,
}) => {
  if (isEditing) {
    return (
      <HStack className="w-full items-baseline gap-3 text-xs font-semibold">
        <Text
          style="header-medium-semibold"
          align="right"
          className="text-slate-400"
        >
          {index}.
        </Text>
        <VStack className="flex flex-grow flex-col gap-2">
          <VStack className="flex items-baseline gap-4">
            <Text fontWeight="semibold" className="text-sm">
              {setSectionSong.song.name}
            </Text>
            <FormField
              control={updateForm.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn("font-normal text-slate-900")}>
                    Song key
                  </FormLabel>
                  <FormControl>
                    {/* TODO: extract into reusable component */}
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value as string}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select song key" />
                      </SelectTrigger>
                      <SelectContent>
                        {songKeys.map((key) => {
                          return (
                            <SelectItem key={key} value={key}>
                              {formatSongKey(key)}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={cn("font-normal text-slate-900")}>
                    Song notes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={unescapeHTML(field.value)}
                      className="font-normal"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </VStack>
        </VStack>
      </HStack>
    );
  }

  return (
    <HStack className="w-full items-baseline gap-3 text-xs font-semibold">
      <Text
        style="header-medium-semibold"
        align="right"
        className="text-slate-400"
      >
        {index}.
      </Text>
      <VStack className="flex flex-grow flex-col gap-4">
        <HStack className="flex items-baseline gap-2">
          <SongKey songKey={setSectionSong.key} />
          <Text fontWeight="semibold" className="text-sm">
            {setSectionSong.song.name}
          </Text>
        </HStack>
        {setSectionSong.notes ? (
          <Text style="small" color="slate-700">
            {unescapeHTML(setSectionSong.notes)}
          </Text>
        ) : null}
      </VStack>
    </HStack>
  );
};

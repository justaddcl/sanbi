import { type Song } from "@/lib/types";
import { Text } from "@components/Text";
import { cn } from "@lib/utils";

export type SongKeyProps = SongKeyGeneralProps &
  (SongKeyFlatProps | SongKeySharpProps);

type SongKeyGeneralProps = {
  /** key song will be played in */
  // songKey: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  songKey: Song["preferredKey"];

  /** size variant */
  size?: "small" | "medium" | "large";
};

// FIXME: update types to no longer include sharp/flat since that will come from the db type
export type SongKeySharpProps = {
  /** is the key sharp? */
  sharp?: true;

  /** `flat` cannot be true if the key is already `sharp` */
  flat?: never;
};

export type SongKeyFlatProps = {
  /** is the key flat? */
  flat?: true;

  /** `sharp` cannot be true if the key is already `flat` */
  sharp?: never;
};

export const SongKey: React.FC<SongKeyProps> = ({
  songKey,
  size = "small",
  // flat,
  // sharp,
}) => {
  const [songKeyLetter, occidental] = songKey!.split("_");
  const flat = occidental === "flat";
  const sharp = occidental === "sharp";

  return (
    <Text
      className={cn(
        `flex flex-none items-center justify-center rounded bg-slate-200  not-italic text-slate-900`,
        [size !== "large" && "text-xs/3 font-medium"],
        [size === "small" && "size-4"],
        [size === "medium" && "size-5"],
        [size === "large" && "size-9 font-semibold"],
      )}
    >
      <span>{songKeyLetter?.toUpperCase()}</span>
      {flat && (
        <span
          className={cn(
            "relative bottom-[2px]",
            [size !== "large" && "text-[10px]"],
            [size === "large" && "text"],
          )}
        >
          ♭
        </span>
      )}
      {sharp && (
        <span
          className={cn("relative bottom-[2px]", [
            size !== "large" && "text-[8px]",
          ])}
        >
          ♯
        </span>
      )}
    </Text>
  );
};

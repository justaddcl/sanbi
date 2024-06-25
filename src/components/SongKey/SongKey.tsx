import { type Song } from "@/lib/types";

export type SongKeyProps = SongKeyGeneralProps &
  (SongKeyFlatProps | SongKeySharpProps);

type SongKeyGeneralProps = {
  /** key song will be played in */
  // songKey: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  songKey: Song["key"];

  /** size variant */
  size?: "small" | "medium";
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
  const badgeSize = size === "small" ? "h-4 w-4" : "h-5 w-5";
  const [songKeyLetter, occidental] = songKey!.split("_");
  const flat = occidental === "flat";
  const sharp = occidental === "sharp";

  return (
    <span
      className={`flex ${badgeSize} flex-none items-center justify-center rounded bg-slate-200 text-xs/3 font-medium text-slate-900`}
    >
      <span>{songKeyLetter?.toUpperCase()}</span>
      {flat && <span className="relative bottom-[2px] text-[10px]">♭</span>}
      {sharp && <span className="relative bottom-[2px] text-[8px]">♯</span>}
    </span>
  );
};

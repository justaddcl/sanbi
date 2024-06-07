export type SongKeyProps = SongKeyGeneralProps &
  (SongKeyFlatProps | SongKeySharpProps);

type SongKeyGeneralProps = {
  /** key song will be played in */
  songKey: "A" | "B" | "C" | "D" | "E" | "F" | "G";

  /** size variant */
  size?: "small" | "medium";
};

type SongKeySharpProps = {
  /** is the key sharp? */
  sharp?: true;

  /** `flat` cannot be true if the key is already `sharp` */
  flat?: never;
};

type SongKeyFlatProps = {
  /** is the key flat? */
  flat?: true;

  /** `sharp` cannot be true if the key is already `flat` */
  sharp?: never;
};

export const SongKey: React.FC<SongKeyProps> = ({
  songKey,
  size = "small",
  flat,
  sharp,
}) => {
  const badgeSize = size === "small" ? "h-4 w-4" : "h-5 w-5";
  return (
    <p
      className={`flex ${badgeSize} flex-none items-center justify-center rounded bg-slate-200 text-xs/3 font-medium`}
    >
      <span>{songKey}</span>
      {flat && <span className="relative bottom-[2px] text-[10px]">♭</span>}
      {sharp && <span className="relative bottom-[2px] text-[8px]">♯</span>}
    </p>
  );
};
import { FileAudio, LinkSimple, MusicNotes } from "@phosphor-icons/react";

import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";

type SongResourcesEmptyStateProps = {
  onAddResourceClick: () => void;
  className?: string;
};

export const SongResourcesEmptyStateBackupArt = () => (
  <div className="relative h-24 w-32 shrink-0" aria-hidden>
    <div className="absolute left-1 top-5 h-14 w-24 rotate-[-8deg] rounded border border-sky-200 bg-sky-50 shadow-sm">
      <div className="m-3 h-2 w-14 rounded bg-sky-300" />
      <div className="mx-3 mt-2 h-1.5 w-10 rounded bg-sky-200" />
    </div>
    <div className="absolute left-5 top-2 h-16 w-24 rotate-[5deg] rounded border border-emerald-200 bg-emerald-50 shadow-sm">
      <MusicNotes className="ml-4 mt-4 text-emerald-600" size={24} />
      <div className="mx-4 mt-3 h-1.5 w-12 rounded bg-emerald-200" />
    </div>
    <div className="absolute bottom-1 right-1 grid size-12 place-items-center rounded-full border border-rose-200 bg-rose-50 shadow-sm">
      <FileAudio className="text-rose-500" size={24} />
    </div>
  </div>
);

const LinkedGlowArt = () => (
  <img
    src="/song-resource-empty-states/linked-glow.png"
    alt=""
    aria-hidden
    className="h-40 w-full max-w-md shrink-0 object-contain object-center"
  />
);

export const SongResourcesEmptyState: React.FC<
  SongResourcesEmptyStateProps
> = ({ onAddResourceClick, className }) => {
  return (
    <li
      className={cn(
        "flex min-h-56 flex-col items-center justify-center gap-5 rounded-md bg-white px-5 py-8 text-center md:col-span-2",
        className,
      )}
    >
      <LinkedGlowArt />
      <div className="flex max-w-sm flex-col items-center gap-2 text-center">
        <Text asElement="h3" style="header-medium-semibold" align="center">
          No resources yet
        </Text>
        <Text style="body-small" className="text-slate-700" align="center">
          Link chord charts, audio recordings, YouTube videos, Spotify tracks,
          and more.
        </Text>
        <Button
          className="mt-2"
          leftIcon={<LinkSimple size={14} className="text-slate-100" />}
          onClick={onAddResourceClick}
        >
          Link a resource
        </Button>
      </div>
    </li>
  );
};

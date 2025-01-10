import { type FC } from "react";
import { type SetSectionWithSongs } from "@lib/types";
import { DotsThree } from "@phosphor-icons/react/dist/ssr";
import { SetListCardBody, SongItem } from "@modules/SetListCard";
import Link from "next/link";
import { Text } from "@components/Text";

export type SetSectionProps = {
  section: SetSectionWithSongs;
  sectionStartIndex: number;
};

export const SetSectionCard: FC<SetSectionProps> = ({
  section,
  sectionStartIndex,
}) => {
  const { id, type, songs } = section;
  return (
    <div
      key={id}
      className="flex flex-col gap-4 rounded border border-slate-200 p-4 shadow"
    >
      <header className="flex flex-col gap-2">
        <div className="flex justify-between">
          <Text asElement="h3" style="header-medium-semibold">
            {type.name}
          </Text>
          <button className="flex h-6 w-6 place-content-center rounded border border-slate-300 p-[6px]">
            <DotsThree className="text-slate-900" size={12} />
          </button>
        </div>
        <hr className="bg-slate-100" />
      </header>
      <SetListCardBody>
        {songs && songs.length > 0 && (
          <div className="flex flex-col gap-3">
            {section.songs.map((setSectionSong) => {
              return (
                <Link
                  key={setSectionSong.songId}
                  href={`../songs/${setSectionSong.songId}`}
                >
                  <SongItem
                    index={sectionStartIndex + setSectionSong.position}
                    songKey={setSectionSong.key}
                    name={setSectionSong.song.name}
                    {...(setSectionSong.notes && {
                      notes: setSectionSong.notes,
                    })}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </SetListCardBody>
    </div>
  );
};

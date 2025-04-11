"use client";

import { SongKey } from "@components/SongKey";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@components/ui/select";
import { type SongKey as SongKeyType, songKeys } from "@lib/constants";
import { formatSongKey } from "@lib/string/formatSongKey";
import { type Song } from "@lib/types";
import { useState } from "react";

type SongKeySelectProps = {
  preferredKey: Song["preferredKey"];
};

export const SongKeySelect: React.FC<SongKeySelectProps> = ({
  preferredKey,
}) => {
  const [songKey, setSongKey] = useState<Song["preferredKey"]>(preferredKey);

  return (
    <Select
      onValueChange={(newKey: SongKeyType) => setSongKey(newKey)}
      defaultValue={songKey as string}
    >
      <SelectTrigger className="w-auto gap-2 border-none p-0">
        <Button variant="ghost" className="p-0">
          <SongKey songKey={songKey} size="large" />
        </Button>
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
  );
};

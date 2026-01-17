import { DotsThree, Heart, Plus } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { Card } from "@components/Card/Card";
import { HStack } from "@components/HStack";
import { VStack } from "@components/VStack";
import { SongDetailsItem } from "@modules/songs/components";

export const SongDetailsPageLoading: React.FC = () => (
  <>
    <HStack className="gap-4">
      <Skeleton className="h-10 w-full" />
      <HStack className="items-start gap-2">
        <Button disabled>
          <Plus /> Add to a set
        </Button>
        <Button variant="outline" disabled size="sm">
          <Heart />
        </Button>
        <Button variant={"outline"} size="sm" disabled>
          <DotsThree className="text-slate-900" size={16} />
        </Button>
      </HStack>
    </HStack>
    <Card title="Song details" collapsible>
      <VStack as="dl" className="gap-4 md:gap-6">
        <SongDetailsItem icon="MusicNoteSimple" label="Preferred Key">
          <dd>
            <Skeleton className="size-9 rounded" />
          </dd>
        </SongDetailsItem>
        <SongDetailsItem icon="ClockCounterClockwise" label="Last Played">
          <dd>
            <Skeleton className="h-4 w-[250px]" />
          </dd>
        </SongDetailsItem>
        <SongDetailsItem icon="Tag" label="Tags">
          <HStack as="dd" className="gap-2">
            <>
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </>
          </HStack>
        </SongDetailsItem>
        <SongDetailsItem icon="NotePencil" label="Notes">
          <VStack className="gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-40" />
          </VStack>
        </SongDetailsItem>
      </VStack>
    </Card>
    <Card
      title="Resources"
      collapsible
      button={
        <Button size="sm" variant="ghost" disabled>
          <Plus className="text-slate-900" size={16} />
          <span className="hidden sm:inline">Add resource</span>
        </Button>
      }
    >
      <ul className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </ul>
    </Card>
    <Card title="Play history" collapsible>
      <div className="grid grid-cols-[16px_1fr] gap-y-4">
        <Skeleton className="size-2 rounded-full" />
        <VStack className="gap-1">
          <Skeleton className="h-3 w-60" />
          <Skeleton className="h-3 w-40" />
        </VStack>
        <Skeleton className="size-2 rounded-full" />
        <VStack className="gap-1">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-3 w-40" />
        </VStack>
        <Skeleton className="size-2 rounded-full" />
        <VStack className="gap-1">
          <Skeleton className="h-3 w-52" />
          <Skeleton className="h-3 w-48" />
        </VStack>
        <Skeleton className="size-2 rounded-full" />
        <VStack className="gap-1">
          <Skeleton className="h-3 w-60" />
          <Skeleton className="h-3 w-40" />
        </VStack>
        <Skeleton className="size-2 rounded-full" />
        <VStack className="gap-1">
          <Skeleton className="h-3 w-52" />
          <Skeleton className="h-3 w-48" />
        </VStack>
      </div>
    </Card>
  </>
);

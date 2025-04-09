import { Card } from "@components/Card/Card";
import { HStack } from "@components/HStack";
import { PageContentContainer } from "@components/PageContentContainer";
import { Skeleton } from "@components/ui/skeleton";
import { VStack } from "@components/VStack";
import { SongDetailsItem } from "@modules/songs/components";

export const SongDetailsPageLoading: React.FC = () => (
  <PageContentContainer>
    <Skeleton className="h-8 w-full" />
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
    <HStack as="section" className="justify-between gap-2">
      <Skeleton className="w-full" />
      <Skeleton className="size-6" />
      <Skeleton className="size-6" />
    </HStack>
    <Card title="Resources" collapsible>
      <div className="grid grid-cols-[repeat(auto-fill,_124px)] grid-rows-[repeat(auto-fill,_92px)] gap-2">
        <Skeleton className="h-full w-full" />
        <Skeleton className="h-full w-full" />
        <Skeleton className="h-full w-full" />
      </div>
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
  </PageContentContainer>
);

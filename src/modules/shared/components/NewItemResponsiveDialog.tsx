"use client";

import { CreateSongForm } from "@modules/sets/components/CreateSongForm/CreateSongForm";
import { useSanbiStore } from "@/providers/sanbi-store-provider";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@components/ResponsiveDialog";
import { Button } from "@components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { CreateSetForm } from "@modules/sets/components/CreateSetForm";
import { MusicNoteSimple, Playlist } from "@phosphor-icons/react/dist/ssr";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

type NewItemResponsiveDialogProps = {};

export const NewItemResponsiveDialog: React.FC<
  NewItemResponsiveDialogProps
> = ({}) => {
  const {
    isCreateItemDialogOpen,
    setIsCreateItemDialogOpen,
    closeCreateItemDialog,
  } = useSanbiStore((state) => state);

  return (
    <ResponsiveDialog
      open={isCreateItemDialogOpen}
      onOpenChange={setIsCreateItemDialogOpen}
    >
      <ResponsiveDialogTrigger asChild>
        <Button className="">New</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="flex justify-center">
        <ResponsiveDialogHeader>
          <VisuallyHidden.Root>
            <>
              <ResponsiveDialogTitle>
                Create new item dialog
              </ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Dialog to create new set or song
              </ResponsiveDialogDescription>
            </>
          </VisuallyHidden.Root>
        </ResponsiveDialogHeader>
        <Tabs
          defaultValue="newSet"
          className="flex w-full flex-col items-center gap-8"
        >
          <TabsList className="flex-none gap-1">
            <TabsTrigger value="newSet" className="gap-1">
              <Playlist />
              New Set
            </TabsTrigger>
            <TabsTrigger value="newSong" className="gap-1">
              <MusicNoteSimple />
              New song
            </TabsTrigger>
          </TabsList>
          <TabsContent value="newSet" className="w-full">
            <CreateSetForm onSubmit={() => closeCreateItemDialog()} />
          </TabsContent>
          <TabsContent value="newSong" className="w-full">
            <CreateSongForm onSubmit={() => closeCreateItemDialog()} />
          </TabsContent>
        </Tabs>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

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

// TODO: add prop to configure which tab is default, with "new set" as fallback (SWY-40)
export const NewItemResponsiveDialog: React.FC = ({}) => {
  const {
    isCreateItemDialogOpen,
    setIsCreateItemDialogOpen,
    closeCreateItemDialog,
    isMobileNavOpen,
    closeMobileNav,
  } = useSanbiStore((state) => state);

  return (
    <ResponsiveDialog
      open={isCreateItemDialogOpen}
      onOpenChange={setIsCreateItemDialogOpen}
    >
      <ResponsiveDialogTrigger asChild>
        <Button
          onClick={() => {
            if (isMobileNavOpen) {
              closeMobileNav();
            }
          }}
        >
          New
        </Button>
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
        {/* TODO: use prop to determine which tab should be default (SWY-40) */}
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

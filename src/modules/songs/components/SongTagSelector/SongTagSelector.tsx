import { useResponsive } from "@/hooks/useResponsive";
import { api, type RouterOutputs } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { KeyboardShortcut } from "@components/KeyboardShortcut";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { ScrollArea } from "@components/ui/scroll-area";
import { Skeleton } from "@components/ui/skeleton";
import { VStack } from "@components/VStack";
import { tagNameSchema } from "@lib/types/zod";
import { cn } from "@lib/utils";
import {
  ArrowDown,
  ArrowUp,
  Check,
  KeyReturn,
  MagnifyingGlass,
  Plus,
  X,
} from "@phosphor-icons/react";
import { type KeyboardEventHandler, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Type for organization tag returned from the API
 */
type OrganizationTag = RouterOutputs["tag"]["getByOrganization"][number];

type SongTagSelectorProps = {
  songId: string;
  organizationId: string;
};

/**
 * SongTagSelector component
 *
 * Provides UI for adding, removing and creating tags for a song.
 * Adapts to desktop and mobile displays with different UIs.
 * Includes search, keyboard navigation, and loading states.
 */
export const SongTagSelector: React.FC<SongTagSelectorProps> = ({
  songId,
  organizationId,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isDesktop } = useResponsive();

  const createSongTagMutation = api.songTag.create.useMutation();
  const createTagMutation = api.tag.create.useMutation({
    onSuccess: (newTag) => {
      createSongTagMutation.mutate({
        songId,
        tagId: newTag.id,
        organizationId,
      });
    },
  });
  const deleteSongTagMutation = api.songTag.delete.useMutation();
  const apiUtils = api.useUtils();

  const {
    data: organizationTags,
    isLoading: isOrganizationTagsQueryLoading,
    error: organizationTagsQueryError,
  } = api.tag.getByOrganization.useQuery({
    organizationId,
  });

  const {
    data: songTags,
    isLoading: isSongTagsQueryLoading,
    error: songTagsQueryError,
  } = api.songTag.getBySongId.useQuery({
    songId,
    organizationId,
  });

  const isLoading = isOrganizationTagsQueryLoading || isSongTagsQueryLoading;
  const hasError = !!organizationTagsQueryError || !!songTagsQueryError;

  const isTagSelected = (tagId: OrganizationTag["id"]) => {
    return songTags?.some((songTag) => songTag.tag.id === tagId);
  };

  const filteredTags = (organizationTags ?? []).filter((tag) =>
    tag.tag.toLowerCase().includes(search.toLowerCase()),
  );

  const showCreateOption =
    search.trim() !== "" &&
    !filteredTags.some((tag) => tag.tag.toLowerCase() === search.toLowerCase());

  const resetSelectorOnSuccess = async () => {
    setOpen(false);

    await apiUtils.songTag.getBySongId.invalidate({
      songId,
      organizationId,
    });
    await apiUtils.song.get.invalidate({
      songId,
      organizationId,
    });

    setSearch("");
    setHighlightedIndex(-1);
  };

  const handleAddTag = (tag: OrganizationTag | undefined) => {
    if (!tag || isTagSelected(tag.id)) return;

    const toastId = toast.loading("Adding tag to song...");

    createSongTagMutation.mutate(
      {
        songId,
        tagId: tag.id,
        organizationId,
      },
      {
        async onSuccess() {
          toast.success("Tag added", { id: toastId });
          await resetSelectorOnSuccess();
        },
        onError(createError) {
          toast.error(`Tag could not be added: ${createError.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  const handleRemoveTag = (tagId: string) => {
    const toastId = toast.loading("Removing tag...");

    deleteSongTagMutation.mutate(
      {
        organizationId,
        songId,
        tagId,
      },
      {
        async onSuccess() {
          toast.success("Tag removed", { id: toastId });

          await resetSelectorOnSuccess();
        },
        onError(deleteError) {
          toast.error(`Could not remove tag: ${deleteError.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  const handleCreateTag = () => {
    const trimmedTag = search
      .trim()
      .normalize("NFC")
      .replace(/\u00A0/g, " "); // NBSP -> normal space

    if (!trimmedTag) return;

    const validationResult = tagNameSchema.safeParse(trimmedTag);

    if (!validationResult.success) {
      const [formattedError] = validationResult.error.format()._errors;
      toast.error(formattedError);
      return;
    }

    const toastId = toast.loading("Creating tag...");

    createTagMutation.mutate(
      {
        tag: validationResult.data,
        organizationId,
      },
      {
        async onSuccess() {
          toast.success("Created tag", { id: toastId });
          await apiUtils.tag.getByOrganization.invalidate({
            organizationId,
          });
          await resetSelectorOnSuccess();
        },
        onError(createError) {
          toast.error(`Tag could not be created: ${createError.message}`, {
            id: toastId,
          });
        },
      },
    );
  };

  const handleTagSelect = (tag: OrganizationTag | undefined) => {
    if (!tag) {
      return;
    }

    if (isTagSelected(tag.id)) {
      handleRemoveTag(tag.id);
    } else {
      handleAddTag(tag);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    keyDownEvent,
  ) => {
    if (!isDesktop) {
      return;
    }

    const totalItems = filteredTags.length + (showCreateOption ? 1 : 0);

    switch (keyDownEvent.key) {
      case "ArrowDown":
        keyDownEvent.preventDefault();
        setHighlightedIndex((prev) => {
          const nextIndex = prev < totalItems - 1 ? prev + 1 : 0;
          // Use requestAnimationFrame to ensure the DOM has updated
          requestAnimationFrame(() => {
            const element = document.querySelector(
              `[data-index="${nextIndex}"]`,
            );
            element?.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          });
          return nextIndex;
        });
        break;

      case "ArrowUp":
        keyDownEvent.preventDefault();
        setHighlightedIndex((prev) => {
          const nextIndex = prev > 0 ? prev - 1 : totalItems - 1;
          // Use requestAnimationFrame to ensure the DOM has updated
          requestAnimationFrame(() => {
            const element = document.querySelector(
              `[data-index="${nextIndex}"]`,
            );
            element?.scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
          });
          return nextIndex;
        });
        break;

      case "Enter":
        keyDownEvent.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < filteredTags.length) {
            handleTagSelect(filteredTags[highlightedIndex]);
          } else if (showCreateOption) {
            handleCreateTag();
          }
        } else if (showCreateOption) {
          handleCreateTag();
        }
        break;

      case "Escape":
        keyDownEvent.preventDefault();
        // Stop propagation to prevent the popover from closing
        keyDownEvent.stopPropagation();

        if (search) {
          handleClearSearch();
        } else {
          setOpen(false);
          setHighlightedIndex(-1);
        }
        break;
    }
  };

  // TODO: refine error state
  if (hasError) {
    toast.error("Unable to load tags");
    return null;
  }

  if (!isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={(open: boolean) => {
          setOpen(open);

          if (!open) {
            setHighlightedIndex(-1);
            setSearch("");
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-full border-dashed text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Tag
          </Button>
        </DialogTrigger>
        <DialogContent fixed className="py-6">
          <DialogHeader align="left">
            <DialogTitle size="md" className="ml-4">
              Song tags
            </DialogTitle>
          </DialogHeader>
          <VStack className="max-h-[400px]">
            <VStack className="gap-2">
              <HStack className="items-center rounded-md bg-slate-100 px-3 py-2">
                <MagnifyingGlass className="mr-2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search tags..."
                  className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="h-5 w-5 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </button>
                )}
              </HStack>

              {isLoading ? (
                <VStack className="gap-6 p-5">
                  <HStack className="h-5 justify-between">
                    <HStack className="gap-3">
                      <Skeleton className="w-4" />
                      <Skeleton className="w-24" />
                    </HStack>
                    <Skeleton className="w-5" />
                  </HStack>
                  <HStack className="h-5 justify-between">
                    <HStack className="gap-3">
                      <Skeleton className="w-4" />
                      <Skeleton className="w-16" />
                    </HStack>
                    <Skeleton className="w-5" />
                  </HStack>
                  <HStack className="h-5 justify-between pl-[28px]">
                    <Skeleton className="w-36" />
                    <Skeleton className="w-5" />
                  </HStack>
                </VStack>
              ) : (
                <ScrollArea className="max-h-[600px] flex-1 px-1 py-2">
                  {filteredTags.length > 0 &&
                    filteredTags.map((tag, index: number) => {
                      const isSelected = isTagSelected(tag.id);

                      return (
                        <HStack
                          key={tag.id}
                          onClick={() => handleTagSelect(tag)}
                          className={cn(
                            "items-center justify-between rounded-lg px-3 py-3 text-sm transition-colors",
                            "cursor-pointer",
                            "hover:bg-slate-100",
                          )}
                          data-index={index}
                        >
                          <HStack className="items-center gap-3">
                            {isSelected && (
                              <Check
                                className={cn("h-4 w-4", "text-primary")}
                              />
                            )}
                            <span className={isSelected ? "ml-0" : "ml-7"}>
                              {tag.tag}
                            </span>
                          </HStack>
                        </HStack>
                      );
                    })}
                  {showCreateOption && (
                    <HStack
                      onClick={handleCreateTag}
                      className={cn(
                        "items-center justify-between rounded-lg px-3 py-3 text-sm transition-colors",
                        "cursor-pointer",
                        "hover:bg-slate-100",
                      )}
                      data-index={filteredTags.length}
                    >
                      <HStack className="ml-7 items-center gap-3">
                        <Plus className="h-3.5 w-3.5" />
                        <span className="text-slate-600">
                          Create new tag: &quot;
                          <span className="text-slate-900">{search}</span>&quot;
                        </span>
                      </HStack>
                    </HStack>
                  )}
                </ScrollArea>
              )}
            </VStack>
          </VStack>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(open: boolean) => {
        setOpen(open);

        if (!open) {
          setHighlightedIndex(-1);
          setSearch("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-full border-dashed text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Tag
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] rounded-lg border-slate-300 p-0 shadow-lg"
        align="start"
        sideOffset={5}
        onEscapeKeyDown={(escKeyEvent) => {
          escKeyEvent.preventDefault();
        }}
      >
        <VStack className="h-[400px]">
          <HStack className="items-center border-b border-slate-300 px-3 py-2">
            <MagnifyingGlass className="mr-2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tags..."
              className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="h-5 w-5 rounded-full text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </HStack>

          <VStack className="min-h-0 flex-1">
            {/* {showSuggestedTags && (
              <div className="mx-2 mb-1 mt-2 rounded-lg bg-secondary/25 px-3 py-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-primary-foreground/90">
                    Suggested Tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTags.map((tag, index) => (
                    <Badge
                      key={tag.id}
                      variant={
                        highlightedIndex === index ? "default" : "outline"
                      }
                      className={cn(
                        "h-7 cursor-pointer px-2 text-sm font-normal transition-colors",
                        highlightedIndex === index
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-secondary/50",
                      )}
                      onClick={() => handleSelectTag(tag)}
                      data-index={index}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )} */}
            {isLoading ? (
              <VStack className="gap-4 p-5">
                <HStack className="h-5 justify-between">
                  <HStack className="gap-3">
                    <Skeleton className="w-4" />
                    <Skeleton className="w-24" />
                  </HStack>
                  <Skeleton className="w-5" />
                </HStack>
                <HStack className="h-5 justify-between">
                  <HStack className="gap-3">
                    <Skeleton className="w-4" />
                    <Skeleton className="w-16" />
                  </HStack>
                  <Skeleton className="w-5" />
                </HStack>
                <HStack className="h-5 justify-between pl-[28px]">
                  <Skeleton className="w-36" />
                  <Skeleton className="w-5" />
                </HStack>
              </VStack>
            ) : (
              <ScrollArea className="h-full px-3">
                <div className="py-2">
                  {filteredTags.length > 0 &&
                    filteredTags.map((tag, index) => {
                      const isSelected = isTagSelected(tag.id);

                      return (
                        <HStack
                          key={tag.id}
                          onClick={() => handleTagSelect(tag)}
                          className={cn(
                            "mx-1 items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                            "cursor-pointer",
                            "hover:bg-slate-100",
                            highlightedIndex === index && "bg-slate-100",
                          )}
                          data-index={index}
                        >
                          <HStack className="items-center gap-3">
                            {isSelected && (
                              <Check
                                className={cn("h-4 w-4", "text-primary")}
                              />
                            )}
                            <span className={isSelected ? "ml-0" : "ml-7"}>
                              {tag.tag}
                            </span>
                          </HStack>
                        </HStack>
                      );
                    })}
                  {showCreateOption && (
                    <HStack
                      onClick={handleCreateTag}
                      className={cn(
                        "mx-1 items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                        "cursor-pointer",
                        "hover:bg-slate-100",
                        highlightedIndex === filteredTags.length &&
                          "bg-slate-100",
                      )}
                      data-index={filteredTags.length}
                    >
                      <HStack className="ml-7 items-center gap-3">
                        <Plus className="h-3.5 w-3.5" />
                        <span className="text-slate-600">
                          Create new tag: &quot;
                          <span className="text-slate-900">{search}</span>
                          &quot;
                        </span>
                      </HStack>
                    </HStack>
                  )}
                </div>
              </ScrollArea>
            )}
          </VStack>

          <HStack className="flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-300 px-3 py-2 text-xs text-muted-foreground">
            <KeyboardShortcut
              primaryKey={<ArrowUp className="h-3 w-3" />}
              secondaryKey={<ArrowDown className="h-3 w-3" />}
              label="Select tag"
            />
            <KeyboardShortcut
              primaryKey={<KeyReturn className="h-3 w-3" />}
              label="Add tag"
            />
            <KeyboardShortcut
              primaryKey={<span>Esc</span>}
              label="Clear filter/close"
            />
          </HStack>
        </VStack>
      </PopoverContent>
    </Popover>
  );
};

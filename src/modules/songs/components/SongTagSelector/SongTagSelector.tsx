import { useResponsive } from "@/hooks/useResponsive";
import { api, type RouterOutputs } from "@/trpc/react";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
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
import { cn } from "@lib/utils";
import {
  ArrowSquareDown,
  ArrowSquareUp,
  Check,
  KeyReturn,
  MagnifyingGlass,
  Plus,
  X,
} from "@phosphor-icons/react";
import { type KeyboardEventHandler, useEffect, useRef, useState } from "react";

type SongTag = RouterOutputs["song"]["get"]["songTags"];
type OrganizationTag = RouterOutputs["tag"]["getByOrganization"][number];

type SongTagSelectorProps = {
  songTags: SongTag;
  organizationId: string;
};

export const SongTagSelector: React.FC<SongTagSelectorProps> = ({
  songTags,
  organizationId,
}) => {
  const [selectedTags, setSelectedTags] =
    useState<SongTagSelectorProps["songTags"]>(songTags);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  // const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { isDesktop } = useResponsive();

  const {
    data: organizationTags,
    isLoading: isOrganizationTagsQueryLoading,
    error: organizationTagsQueryError,
  } = api.tag.getByOrganization.useQuery({
    organizationId,
  });

  const isTagSelected = (tagId: OrganizationTag["id"]) => {
    return selectedTags.some((songTag) => songTag.tag.id === tagId);
  };

  // Filter tags based on search - ALWAYS include already selected tags in search results
  const filteredTags = (organizationTags ?? []).filter((tag) =>
    tag.tag.toLowerCase().includes(search.toLowerCase()),
  );
  // .sort((a, b) => {
  //   // First sort by selection status (selected tags first)
  //   const aSelected = isTagSelected(a.id);
  //   const bSelected = isTagSelected(b.id);
  //   if (aSelected && !bSelected) return -1;
  //   if (!aSelected && bSelected) return 1;

  //   // Then sort by count (most used first)
  //   return b.count - a.count;
  // });

  const handleSelectTag = (tag: OrganizationTag | undefined) => {
    // If tag is already selected, do nothing
    if (!tag || isTagSelected(tag.id)) return;

    // TODO: create songTag mutation

    // const updatedTags = [...selectedTags, tag];
    // setSelectedTags(updatedTags);
    // onTagsChange?.(updatedTags);
    setSearch("");
    setHighlightedIndex(-1);
  };

  const handleRemoveTag = (tagId: string) => {
    // TODO: delete songTag mutation
    // const updatedTags = selectedTags.filter((tag) => tag.id !== tagId);
    // setSelectedTags(updatedTags);
    // onTagsChange?.(updatedTags);
  };

  const handleCreateTag = () => {
    if (!search.trim()) return;
    // TODO: create songTag mutation

    // const newTag = {
    //   id: search.toLowerCase().replace(/\s+/g, "-"),
    //   name: search.trim(),
    // };

    // // Check if tag already exists
    // if (
    //   selectedTags.some((tag) => tag.id === newTag.id) ||
    //   availableTags.some((tag) => tag.id === newTag.id)
    // ) {
    //   return;
    // }

    // const updatedTags = [...selectedTags, newTag];
    // setSelectedTags(updatedTags);
    // onTagsChange?.(updatedTags);
    // setSearch("");
    // setHighlightedIndex(-1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    keyDownEvent,
  ) => {
    // Get all selectable items (suggested tags + filtered tags + create option)
    const selectableItems = [
      // ...(showSuggestedTags ? suggestedTags : []),
      ...filteredTags.filter((tag) => !isTagSelected(tag.id)),
    ];

    // Only show create option if there are no matching unselected tags
    const hasUnselectedMatches = filteredTags.some(
      (tag) => !isTagSelected(tag.id),
    );
    const hasCreateOption = search.trim() !== "" && !hasUnselectedMatches;
    const totalItems = selectableItems.length + (hasCreateOption ? 1 : 0);

    switch (keyDownEvent.key) {
      case "ArrowDown":
        keyDownEvent.preventDefault();
        setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        break;

      case "ArrowUp":
        keyDownEvent.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        break;

      case "Enter":
        keyDownEvent.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < selectableItems.length) {
            handleSelectTag(selectableItems[highlightedIndex]);
          } else if (hasCreateOption) {
            handleCreateTag();
          }
        } else if (hasCreateOption) {
          handleCreateTag();
        }
        break;

      case "Escape":
        keyDownEvent.preventDefault();
        // Stop propagation to prevent the popover from closing
        keyDownEvent.stopPropagation();

        if (search) {
          // Only clear search, don't close dropdown
          handleClearSearch();
        } else {
          // Close dropdown only if search is empty
          setOpen(false);
        }
        break;
    }
  };

  // FIXME: this isn't working
  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setHighlightedIndex(-1);
    }
  }, [open]);

  const showCreateOption = search.trim() !== "" && filteredTags.length === 0;

  if (!isDesktop) {
    return (
      <Dialog>
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
          <div className="flex max-h-[400px] flex-col bg-gradient-to-br from-background to-background/95 backdrop-blur-sm">
            <VStack className="gap-4">
              <div className="flex items-center rounded-md bg-slate-100 px-3 py-2">
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
              </div>

              {showCreateOption ? (
                <div className="px-3 py-3">
                  <button
                    onClick={handleCreateTag}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      highlightedIndex === 0
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-secondary/50",
                    )}
                    data-index={0}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create new tag: &quot;{search}&quot;</span>
                  </button>
                </div>
              ) : isOrganizationTagsQueryLoading ? (
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
                <ScrollArea className="max-h-[600px] flex-1 px-1 py-1">
                  <VStack className="gap-6">
                    {filteredTags.length > 0 &&
                      filteredTags.map((tag, index: number) => {
                        // Adjust index based on whether suggested tags are shown
                        // const adjustedIndex = showSuggestedTags
                        //   ? index + suggestedTags.length
                        //   : index;
                        const isSelected = isTagSelected(tag.id);

                        return (
                          <div
                            key={tag.id}
                            onClick={() => !isSelected && handleSelectTag(tag)}
                            className={cn(
                              "mx-1 flex items-center justify-between rounded-lg px-3 text-sm transition-colors",
                              isSelected
                                ? "cursor-default opacity-90"
                                : "cursor-pointer",
                              highlightedIndex === index && !isSelected
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : !isSelected
                                  ? "hover:bg-secondary/50"
                                  : "",
                            )}
                            data-index={!isSelected ? index : undefined}
                          >
                            <div className="flex items-center gap-3">
                              {isSelected && (
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    highlightedIndex === index
                                      ? "text-primary-foreground"
                                      : "text-primary",
                                  )}
                                />
                              )}
                              <span className={isSelected ? "ml-0" : "ml-7"}>
                                {tag.tag}
                              </span>
                            </div>
                            {/* <span
                          className={cn(
                            "text-xs",
                            highlightedIndex === index
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {tag.count}
                        </span> */}
                          </div>
                        );
                      })}
                  </VStack>
                </ScrollArea>
              )}
            </VStack>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        ref={popoverRef}
        className="w-[320px] overflow-hidden rounded-lg border-none p-0 shadow-lg"
        align="start"
        sideOffset={5}
        onEscapeKeyDown={(escKeyEvent) => escKeyEvent.preventDefault()}
      >
        <div className="flex max-h-[400px] flex-col bg-gradient-to-br from-background to-background/95 backdrop-blur-sm">
          <div className="flex items-center border-b border-border/50 px-3 py-2">
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
          </div>

          <div className="flex min-h-0 flex-1 flex-col" ref={listRef}>
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

            {showCreateOption ? (
              <div className="px-3 py-3">
                <button
                  onClick={handleCreateTag}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    highlightedIndex === 0
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-secondary/50",
                  )}
                  data-index={0}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create new tag: &quot;{search}&quot;</span>
                </button>
              </div>
            ) : isOrganizationTagsQueryLoading ? (
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
              <ScrollArea className="max-h-[600px] flex-1 px-1 py-1">
                {filteredTags.length > 0 &&
                  filteredTags.map((tag, index) => {
                    // Adjust index based on whether suggested tags are shown
                    // const adjustedIndex = showSuggestedTags
                    //   ? index + suggestedTags.length
                    //   : index;
                    const isSelected = isTagSelected(tag.id);

                    return (
                      <div
                        key={tag.id}
                        onClick={() => !isSelected && handleSelectTag(tag)}
                        className={cn(
                          "mx-1 flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                          isSelected
                            ? "cursor-default opacity-90"
                            : "cursor-pointer",
                          highlightedIndex === index && !isSelected
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : !isSelected
                              ? "hover:bg-secondary/50"
                              : "",
                        )}
                        data-index={!isSelected ? index : undefined}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected && (
                            <Check
                              className={cn(
                                "h-4 w-4",
                                highlightedIndex === index
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          )}
                          <span className={isSelected ? "ml-0" : "ml-7"}>
                            {tag.tag}
                          </span>
                        </div>
                        {/* <span
                          className={cn(
                            "text-xs",
                            highlightedIndex === index
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {tag.count}
                        </span> */}
                      </div>
                    );
                  })}
              </ScrollArea>
            )}

            <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <ArrowSquareUp className="h-3 w-3" />
                  <ArrowSquareDown className="h-3 w-3" />
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <KeyReturn className="h-3 w-3" />
                  <span>Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Text>ESC</Text>
                <span>Esc to clear/close</span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

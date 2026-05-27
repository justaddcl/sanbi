"use client";

import { LinkSimple, MusicNotes, Plus, TextAa } from "@phosphor-icons/react";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@components/ui/sheet";
import { Switch } from "@components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Textarea } from "@components/ui/textarea";
import { Text } from "@components/Text";
import { SetListCard } from "@modules/SetListCard/components";
import { SongResourcesEmptyState } from "@modules/songs/components/SongResources/SongResourcesEmptyState";
import { cn } from "@lib/utils";

import { type VisualHarnessSurface } from "./types";

type VisualHarnessProps = {
  surface: VisualHarnessSurface;
  theme: "light" | "dark";
};

const typographySamples = [
  { style: "header-large", label: "Header large", className: "text-4xl" },
  { style: "header-medium", label: "Header medium", className: "text-lg" },
  { style: "body-small", label: "Body small", className: "text-sm" },
  { style: "small-semibold", label: "Small semibold", className: "text-xs" },
] as const;

const HarnessFrame = ({
  theme,
  children,
}: React.PropsWithChildren<Pick<VisualHarnessProps, "theme">>) => (
  <main
    data-visual-harness
    className={cn(
      "min-h-screen bg-background px-4 py-6 text-foreground sm:px-8",
      theme === "dark" && "dark",
    )}
  >
    <div className="container mx-auto flex flex-col gap-6 rounded border bg-background p-4 shadow-xs sm:p-6">
      {children}
    </div>
  </main>
);

const SectionHeading = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="space-y-1">
    <Text asElement="h1" style="header-large">
      {title}
    </Text>
    <Text style="body-small" className="max-w-2xl text-muted-foreground">
      {description}
    </Text>
  </div>
);

const ControlsSurface = () => (
  <>
    <SectionHeading
      title="Controls"
      description="Stable form controls, shadcn primitives, token colors, focus rings, and spacing."
    />
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="grid gap-4 rounded-md border bg-card p-4 text-card-foreground">
        <div className="grid gap-3 sm:grid-cols-2">
          <Button leftIcon={<Plus size={14} />}>Create set</Button>
          <Button variant="outline">Outline action</Button>
          <Button variant="secondary">Secondary action</Button>
          <Button variant="destructive">Remove song</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="visual-title">Song title</Label>
            <Input id="visual-title" size="medium" value="Joyful Noise" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visual-key">Default key</Label>
            <Select value="g">
              <SelectTrigger id="visual-key">
                <SelectValue placeholder="Select key" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="g">G</SelectItem>
                <SelectItem value="d">D</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="visual-notes">Notes</Label>
          <Textarea
            id="visual-notes"
            value="Watch the bridge dynamics and repeat the final chorus."
            readOnly
          />
        </div>
      </section>
      <section className="flex flex-col gap-4 rounded-md border bg-card p-4 text-card-foreground">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="visual-switch">Auto archive</Label>
          <Switch id="visual-switch" checked />
        </div>
        <div className="flex items-center gap-3">
          <Checkbox id="visual-checkbox" checked />
          <Label htmlFor="visual-checkbox">Include in next rehearsal</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="warn">Needs review</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <Tabs defaultValue="songs">
          <TabsList>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="songs" className="rounded-md border p-3">
            <Text style="body-small">Three songs ready for Sunday.</Text>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  </>
);

const CardsSurface = () => (
  <>
    <SectionHeading
      title="Sanbi Cards"
      description="Set cards, song rows, resource states, dynamic typography, and container widths."
    />
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <SetListCard>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Text asElement="h2" style="header-medium-semibold">
                Sunday Gathering
              </Text>
              <Text style="body-small" className="text-muted-foreground">
                4 songs - 2 sections - March 10
              </Text>
            </div>
            <Badge variant="secondary">Ready</Badge>
          </div>
          <div className="grid gap-3">
            {["Call to Worship", "Offering", "Sending"].map((section, index) => (
              <div
                key={section}
                className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                <div className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <Text className="truncate font-medium">{section} Song</Text>
                  <Text style="small" className="text-muted-foreground">
                    Key G - Capo 2 - Acoustic lead
                  </Text>
                </div>
                <MusicNotes size={18} className="text-slate-500" />
              </div>
            ))}
          </div>
        </div>
      </SetListCard>
      <div className="grid gap-5">
        <SongResourcesEmptyState onAddResourceClick={() => undefined} />
        <div className="grid gap-2 rounded-md border bg-card p-4 text-card-foreground">
          <div className="flex items-center gap-2">
            <TextAa size={18} />
            <Text style="header-medium-semibold">Typography</Text>
          </div>
          {typographySamples.map((sample) => (
            <Text key={sample.label} className={sample.className}>
              {sample.label}
            </Text>
          ))}
          <Button leftIcon={<LinkSimple size={14} />}>Link resource</Button>
        </div>
      </div>
    </div>
  </>
);

const DialogSurface = () => (
  <>
    <ControlsSurface />
    <Dialog open onOpenChange={() => undefined}>
      <DialogContent animated={false} data-visual-harness-dialog>
        <DialogHeader>
          <DialogTitle>Archive set</DialogTitle>
          <DialogDescription>
            This confirms dialog spacing, overlay color, borders, shadows, and
            button alignment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Archive</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
);

const SheetSurface = () => (
  <>
    <CardsSurface />
    <Sheet open onOpenChange={() => undefined}>
      <SheetContent data-visual-harness-sheet side="right">
        <SheetHeader>
          <SheetTitle>Set options</SheetTitle>
          <SheetDescription>
            Validate sheet width, border color, shadow, and dark theme tokens.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 grid gap-3">
          <Button variant="outline">Duplicate set</Button>
          <Button variant="destructive">Archive set</Button>
        </div>
      </SheetContent>
    </Sheet>
  </>
);

const PopoverSurface = () => (
  <>
    <ControlsSurface />
    <div className="flex justify-center py-8">
      <Popover open onOpenChange={() => undefined}>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent data-visual-harness-popover>
          <div className="space-y-2">
            <Text style="header-medium-semibold">Resource status</Text>
            <Text style="body-small" className="text-muted-foreground">
              Popover shadows, border tokens, and text colors should remain
              stable after the migration.
            </Text>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </>
);

const surfaceComponents: Record<VisualHarnessSurface, React.ReactNode> = {
  controls: <ControlsSurface />,
  cards: <CardsSurface />,
  dialog: <DialogSurface />,
  sheet: <SheetSurface />,
  popover: <PopoverSurface />,
};

export const VisualHarness = ({ surface, theme }: VisualHarnessProps) => (
  <HarnessFrame theme={theme}>{surfaceComponents[surface]}</HarnessFrame>
);

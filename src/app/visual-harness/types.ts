export const visualHarnessSurfaces = [
  "controls",
  "cards",
  "dialog",
  "sheet",
  "popover",
] as const;

export type VisualHarnessSurface = (typeof visualHarnessSurfaces)[number];

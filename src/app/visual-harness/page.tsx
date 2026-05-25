import { notFound } from "next/navigation";

import { VisualHarness } from "./VisualHarness";
import { type VisualHarnessSurface, visualHarnessSurfaces } from "./types";

type VisualHarnessPageProps = {
  searchParams?: {
    surface?: string;
    theme?: string;
  };
};

const isVisualHarnessSurface = (
  surface: string | undefined,
): surface is VisualHarnessSurface =>
  visualHarnessSurfaces.includes(surface as VisualHarnessSurface);

export default function VisualHarnessPage({
  searchParams,
}: VisualHarnessPageProps) {
  if (
    process.env.SANBI_VISUAL_HARNESS !== "1" ||
    process.env.NODE_ENV === "production"
  ) {
    notFound();
  }

  const surface = isVisualHarnessSurface(searchParams?.surface)
    ? searchParams.surface
    : "controls";
  const theme = searchParams?.theme === "dark" ? "dark" : "light";

  return <VisualHarness surface={surface} theme={theme} />;
}

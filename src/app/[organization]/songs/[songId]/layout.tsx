import { PageContentContainer } from "@components/PageContentContainer";

export default function SongDetailsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageContentContainer>{children}</PageContentContainer>;
}

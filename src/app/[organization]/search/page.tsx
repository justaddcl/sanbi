import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { SearchResultsPage } from "@modules/search";
import { HydrateClient } from "@lib/trpc/server";

type SearchPageProps = {
  params: Promise<{ organization: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getSearchParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getInitialFilter = (value: string | string[] | undefined) => {
  const filter = getSearchParamValue(value);

  return filter === "songs" || filter === "tags" ? filter : "all";
};

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { organization } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const initialQuery = getSearchParamValue(resolvedSearchParams.q) ?? "";
  const initialFilter = getInitialFilter(resolvedSearchParams.filter);

  return (
    <HydrateClient>
      <SearchResultsPage
        organizationId={organization}
        initialQuery={initialQuery}
        initialFilter={initialFilter}
      />
    </HydrateClient>
  );
}

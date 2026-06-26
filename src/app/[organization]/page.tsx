import { notFound } from "next/navigation";
import { validate as uuidValidate } from "uuid";

import { OrganizationDashboardSets } from "@modules/sets/components/OrganizationDashboardSets";
import { logger } from "@lib/loggers/logger";
import { HydrateClient, trpc } from "@lib/trpc/server";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ organization: string }>;
}) {
  // TODO: solve how to handle slugs vs. org IDs

  const { organization } = await params;
  const isOrgIdValidUuid = uuidValidate(organization);
  if (!isOrgIdValidUuid) {
    logger.error(
      `🤖 - ${organization} is not a valid UUID - queries/getOrganization`,
    );
    notFound();
  }

  await trpc.set.getOrganizationSets.prefetch({
    organizationId: organization,
  });

  return (
    <HydrateClient>
      <OrganizationDashboardSets organizationId={organization} />
    </HydrateClient>
  );
}

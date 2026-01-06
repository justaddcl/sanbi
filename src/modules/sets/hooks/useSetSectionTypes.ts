import { useEffect, useState } from "react";

import { type ComboboxOption } from "@components/ui/combobox";
import { trpc } from "@lib/trpc";

export function useSectionTypesOptions(organizationId?: string) {
  const [options, setOptions] = useState<ComboboxOption[]>([]);

  const { data, error, isLoading } = trpc.setSectionType.getTypes.useQuery(
    { organizationId: organizationId! }, // we use a type assertion here since the query will be disabled if organizationId is falsy
    { enabled: !!organizationId },
  );

  useEffect(() => {
    if (!isLoading && !error && data) {
      const mappedOptions =
        data.map((type) => ({
          id: type.id,
          label: type.name,
        })) ?? [];

      setOptions(mappedOptions);
    }
  }, [isLoading, data, error]);

  return {
    options,
    isLoading,
    error,
  };
}

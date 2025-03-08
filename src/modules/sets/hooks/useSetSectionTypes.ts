import { api } from "@/trpc/react";
import { type ComboboxOption } from "@components/ui/combobox";
import { useEffect, useState } from "react";

export function useSectionTypesOptions(organizationId: string) {
  const [options, setOptions] = useState<ComboboxOption[]>([]);

  const { data, error, isLoading } = api.setSectionType.getTypes.useQuery(
    { organizationId },
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

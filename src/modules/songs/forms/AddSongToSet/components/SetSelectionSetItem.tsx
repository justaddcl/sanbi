import { HStack } from "@components/HStack";
import { Text } from "@components/Text";

type SetSelectionSetItemProps = {
  title: string;
  subtitle?: string;
  label?: string;
};

export const SetSelectionSetItem: React.FC<SetSelectionSetItemProps> = ({
  title,
  subtitle,
  label,
}) => {
  return (
    <HStack className="cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
        <Text className="font-medium">{title}</Text>
        {subtitle && <Text className="text-sm text-slate-500">{subtitle}</Text>}
      </div>
      {label && <Text className="text-sm text-slate-500">{label}</Text>}
    </HStack>
  );
};

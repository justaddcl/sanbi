import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { cn } from "@lib/utils";

type SetSelectionSetItemProps = React.ComponentPropsWithoutRef<"div"> & {
  title: string;
  titleTooltip?: string;
  subtitle?: string;
  label?: string;
  onClick?: () => void;
};

export const SetSelectionSetItem: React.FC<SetSelectionSetItemProps> = ({
  title,
  titleTooltip,
  subtitle,
  label,
  className,
  onClick,
}) => {
  return (
    <HStack
      className={cn(
        "cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
        {titleTooltip ? (
          <Tooltip>
            <TooltipTrigger>
              <Text className="font-semibold">{title}</Text>
            </TooltipTrigger>
            <TooltipContent>{titleTooltip}</TooltipContent>
          </Tooltip>
        ) : (
          <Text className="font-semibold">{title}</Text>
        )}
        {subtitle && <Text className="text-sm text-slate-500">{subtitle}</Text>}
      </div>
      {label && <Text className="text-sm text-slate-500">{label}</Text>}
    </HStack>
  );
};

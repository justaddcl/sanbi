import { Text } from "@components/Text";
import { cn } from "@lib/utils";
export type BadgeProps = {
  label: string;
  size?: "sm" | "md";
};

export const Badge: React.FC<BadgeProps> = ({ label, size = "md" }) => {
  return (
    <Text
      style="body-small"
      className={cn("rounded bg-slate-200 px-2 py-1", [
        size === "sm" && "px-1.5",
      ])}
    >
      {label}
    </Text>
  );
};

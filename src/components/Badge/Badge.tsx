import { Text } from "@components/Text";
export type BadgeProps = {
  label: string;
};

export const Badge: React.FC<BadgeProps> = ({ label }) => {
  return (
    <Text style="body-small" className="rounded bg-slate-200 px-2 py-1">
      {label}
    </Text>
  );
};

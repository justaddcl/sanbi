import { VStack } from "@components/VStack";
import {
  SongDetailsLabel,
  type SongDetailsLabelProps,
} from "../SongDetailsLabel/SongDetailsLabel";

type SongDetailsItemProps = React.PropsWithChildren & {
  icon: SongDetailsLabelProps["icon"];
  label: SongDetailsLabelProps["label"];
};
export const SongDetailsItem: React.FC<SongDetailsItemProps> = ({
  icon,
  label,
  children,
}) => {
  return (
    <VStack className="gap-2">
      <SongDetailsLabel icon={icon} label={label} />
      {children}
    </VStack>
  );
};

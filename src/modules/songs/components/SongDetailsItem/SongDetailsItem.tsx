import { VStack } from "@components/VStack";
import {
  SongDetailsLabel,
  type SongDetailsLabelProps,
} from "../SongDetailsLabel/SongDetailsLabel";

type SongDetailsItem = React.PropsWithChildren & {
  icon: SongDetailsLabelProps["icon"];
  label: SongDetailsLabelProps["label"];
};
export const SongDetailsItem: React.FC<SongDetailsItem> = ({
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

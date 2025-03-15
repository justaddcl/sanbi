import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { MusicNoteSimple } from "@phosphor-icons/react/dist/ssr";

type SetEmptyStateProps = {
  onActionClick: () => void;
};

export const SetEmptyState: React.FC<SetEmptyStateProps> = ({
  onActionClick,
}) => {
  return (
    <div className="flex grow flex-col items-center justify-center gap-4 min-[1025px]:mt-32 min-[1025px]:grow-0">
      <Text style="header-medium-semibold">No songs... yet</Text>
      <Text style="body-small" className="text-slate-700">
        Add a song to start building your set
      </Text>
      <Button
        leftIcon={<MusicNoteSimple size={14} className="text-slate-100" />}
        onClick={onActionClick}
      >
        Add a song
      </Button>
    </div>
  );
};

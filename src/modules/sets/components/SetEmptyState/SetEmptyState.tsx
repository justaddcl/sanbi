import { Text } from "@components/Text";
import { Button } from "@components/ui/button";
import { MusicNoteSimple } from "@phosphor-icons/react/dist/ssr";

export const SetEmptyState: React.FC = () => {
  return (
    <div className="flex grow flex-col items-center justify-center gap-4">
      <Text style="header-medium-semibold">No songs... yet</Text>
      <Text style="body-small" className="text-slate-700">
        Add a song or section to start putting your set together
      </Text>
      {/* TODO: wire up button with onClick handler */}
      <Button
        leftIcon={<MusicNoteSimple size={14} className="text-slate-100" />}
      >
        Add a song
      </Button>
    </div>
  );
};

import { Text } from "@components/Text";

export type SetListCardSectionProps = {
  title: string;
};

export const SetListCardSection: React.FC<
  React.PropsWithChildren<SetListCardSectionProps>
> = ({ title, children }) => {
  return (
    <section>
      <Text
        asElement="h4"
        style="small"
        color="slate-500"
        className="mb-2 uppercase "
      >
        {title}
      </Text>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  );
};

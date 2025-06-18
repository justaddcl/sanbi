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
        className="mb-2 text-sm font-medium uppercase text-slate-500"
      >
        {title}
      </Text>
      <div className="flex flex-col gap-2 md:gap-3">{children}</div>
    </section>
  );
};

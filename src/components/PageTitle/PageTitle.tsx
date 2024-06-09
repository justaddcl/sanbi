import { Text } from "@components/Text";

export type PageTitleProps = {
  /** title */
  title: string;

  /** subtitle */
  subtitle?: string;

  /** small text under title/subtitle */
  details?: string;
};

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  details,
}) => {
  return (
    <header className="flex flex-col gap-1 pb-2">
      {/* <h1 className="text-2xl font-bold">{title}</h1> */}
      <Text asElement="h1" style="header-large">
        {title}
      </Text>
      {subtitle ? (
        <Text asElement="h2" style="header-medium" className="leading-tight">
          {subtitle}
        </Text>
      ) : null}
      {details ? (
        <Text asElement="h3" style="header-small">
          {details}
        </Text>
      ) : null}
    </header>
  );
};

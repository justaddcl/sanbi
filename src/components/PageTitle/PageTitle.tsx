import { Text } from "@components/Text";
import { VStack } from "@components/VStack";

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
    <VStack as="header" className="flex flex-col gap-1 pb-2">
      <Text
        asElement="h1"
        style="header-large"
        className="text-2xl lg:text-4xl"
      >
        {/* TODO: format the date to match locale */}
        {title}
      </Text>
      {subtitle && (
        <Text
          asElement="h2"
          style="header-medium"
          className="leading-tight text-slate-700"
        >
          {subtitle}
        </Text>
      )}
      {details && (
        <Text asElement="h3" style="header-small" className="text-slate-500">
          {details}
        </Text>
      )}
    </VStack>
  );
};

import { HStack } from "@components/HStack";
import { Text } from "@components/Text";
import { VStack } from "@components/VStack";

export type PageTitleProps = {
  /** title */
  title: string;

  /** subtitle */
  subtitle?: string;

  /** small text under title/subtitle */
  details?: string;

  badge?: React.ReactElement;
};

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  details,
  badge,
}) => {
  return (
    <VStack as="header" className="flex flex-col gap-1 pb-2">
      <HStack className="items-center gap-4">
        <Text
          asElement="h1"
          style="header-large"
          className="text-2xl lg:text-4xl"
        >
          {/* TODO: format the date to match locale */}
          {title}
        </Text>
        {!!badge && badge}
      </HStack>
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

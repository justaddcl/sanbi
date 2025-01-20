import { VStack } from "@components/VStack";

export type CardListProps = {
  /** spacing between cards - uses TailwindCSS values - https://tailwindcss.com/docs/gap  */
  gap?: string;
};

export const CardList: React.FC<React.PropsWithChildren<CardListProps>> = ({
  gap = "gap-4",
  children,
}) => {
  return <VStack className={`flex flex-col ${gap}`}>{children}</VStack>;
};

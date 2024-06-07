export type CardListProps = {
  gap?: string;
};

export const CardList: React.FC<React.PropsWithChildren<CardListProps>> = ({
  gap = "gap-4",
  children,
}) => {
  return <div className={`flex flex-col ${gap}`}>{children}</div>;
};

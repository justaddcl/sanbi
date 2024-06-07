export const SetListCardBody: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return <div className="flex flex-col gap-y-3">{children}</div>;
};

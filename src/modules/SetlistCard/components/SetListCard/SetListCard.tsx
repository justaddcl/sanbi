export const SetListCard: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className="min-w-full rounded border border-slate-200 p-4 shadow">
      {children}
    </div>
  );
};

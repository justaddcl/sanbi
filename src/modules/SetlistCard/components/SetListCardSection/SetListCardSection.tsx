export type SetListCardSectionProps = {
  title: string;
};

export const SetListCardSection: React.FC<
  React.PropsWithChildren<SetListCardSectionProps>
> = ({ title, children }) => {
  // something

  return (
    <section>
      <h3 className="mb-2 text-[10px] uppercase text-slate-500">{title}</h3>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  );
};

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
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle ? (
        <h2 className="text-base text-slate-700">{subtitle}</h2>
      ) : null}
      {details ? <p className="text-xs text-slate-500">{details}</p> : null}
    </header>
  );
};

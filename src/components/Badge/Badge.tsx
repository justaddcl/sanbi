export type BadgeProps = {
  label: string;
};

export const Badge: React.FC<BadgeProps> = ({ label }) => {
  return (
    <span className="rounded bg-slate-200 px-2 py-1 text-slate-900">
      {label}
    </span>
  );
};

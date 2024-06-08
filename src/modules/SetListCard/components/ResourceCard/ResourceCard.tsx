import { Link } from "@phosphor-icons/react/dist/ssr";

export type ResourceCardProps = {
  title: string;
  url: string;
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ title, url }) => {
  return (
    <div className="flex h-[92px] w-[124px] flex-col rounded bg-slate-200">
      <div className="flex h-full flex-[6] items-center justify-center rounded-t bg-slate-300">
        <Link className="text-slate-400" size={24} />
      </div>
      <div className="flex-[4] px-2 py-1">
        <p className="text-[10px] font-semibold text-slate-700">{title}</p>
        <p className="text-[8px] text-slate-500">{url}</p>
      </div>
    </div>
  );
};

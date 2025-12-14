import { Bot } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  aiVerified?: boolean;
}

export const StatusBadge = ({ status, aiVerified }: StatusBadgeProps) => {
  let colorClass = 'bg-slate-100 text-slate-600';
  const s = status.toLowerCase();

  if (s.includes('completed') || s.includes('done')) colorClass = 'bg-emerald-100 text-emerald-700';
  else if (s.includes('ongoing') || s.includes('working')) colorClass = 'bg-blue-100 text-blue-700';
  else if (s.includes('not started')) colorClass = 'bg-slate-100 text-slate-500';
  else if (s.includes('issue') || s.includes('attention')) colorClass = 'bg-rose-100 text-rose-700';

  return (
    <div className="flex items-center gap-1.5">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} border border-transparent whitespace-nowrap`}>
        {status}
      </span>
      {aiVerified && (
        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full flex items-center gap-1 font-semibold border border-indigo-200 whitespace-nowrap">
          <Bot size={10} /> AI Verified
        </span>
      )}
    </div>
  );
};

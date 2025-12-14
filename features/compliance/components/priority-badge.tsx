interface PriorityBadgeProps {
  level: string;
}

export const PriorityBadge = ({ level }: PriorityBadgeProps) => {
  let colorClass = 'bg-slate-100 text-slate-600';
  if (level.includes('High')) colorClass = 'bg-rose-50 text-rose-600 border-rose-200';
  if (level.includes('Medium')) colorClass = 'bg-amber-50 text-amber-600 border-amber-200';
  if (level.includes('Low')) colorClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${colorClass}`}>
      {level.split(' ')[0]}
    </span>
  );
};

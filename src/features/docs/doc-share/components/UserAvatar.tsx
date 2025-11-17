import { cn } from '@/lib/utils';
import { User } from '@/types/api';

const avatarsColors = [
  'bg-blue-500',
  'bg-brown-500',
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-amber-500',
];

const getColorFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarsColors[Math.abs(hash) % avatarsColors.length];
};

type Props = {
  user: User;
  className?: string;
};

export const UserAvatar = ({ user, className }: Props) => {
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || '?';
  const splitName = name?.split(' ');

  return (
    <div
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full border border-white/50 text-white/90',
        getColorFromName(name),
        className
      )}
    >
      <span className="text-center text-[10px] font-semibold uppercase">
        {splitName[0]?.charAt(0)}
        {splitName?.[1]?.charAt(0)}
      </span>
    </div>
  );
};

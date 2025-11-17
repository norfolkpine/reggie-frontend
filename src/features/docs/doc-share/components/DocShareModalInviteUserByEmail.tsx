import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { User } from '@/types/api';
import { cn } from '@/lib/utils';

import { SearchUserRow } from './SearchUserRow';

type Props = {
  user: User;
  className?: string;
};

export const DocShareModalInviteUserRow = ({ user, className }: Props) => {
  const { t } = useTranslation();

  return (
    <div 
      className={cn("w-full", className)}
      data-testid={`search-user-row-${user.email}`}
    >
      <SearchUserRow
        user={user}
        right={
          <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/90">
            <span>{t('Add')}</span>
            <Plus className="h-4 w-4" />
          </div>
        }
      />
    </div>
  );
};

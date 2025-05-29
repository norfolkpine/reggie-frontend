import {
  QuickSearchItemContent,
  QuickSearchItemContentProps,
} from '@/components/quick-search';
import { User } from '@/types/api';
import { cn } from '@/lib/utils';

import { UserAvatar } from './UserAvatar';

type Props = {
  user: User;
  alwaysShowRight?: boolean;
  right?: QuickSearchItemContentProps['right'];
  isInvitation?: boolean;
};

export const SearchUserRow = ({
  user,
  right,
  alwaysShowRight = false,
  isInvitation = false,
}: Props) => {
  const hasFullName = user.first_name && user.last_name;

  return (
    <QuickSearchItemContent
      right={right}
      alwaysShowRight={alwaysShowRight}
      left={
        <div className="flex items-center gap-2">
          <UserAvatar
            user={user}
            className={cn(
              isInvitation && "bg-muted"
            )}
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {hasFullName ? `${user.first_name} ${user.last_name}` : user.email}
            </span>
            {hasFullName && (
              <span className="text-xs text-muted-foreground -mt-0.5">
                {user.email}
              </span>
            )}
          </div>
        </div>
      }
    />
  );
};

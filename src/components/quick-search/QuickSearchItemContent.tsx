import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveStore } from '@/stores';

export type QuickSearchItemContentProps = {
  alwaysShowRight?: boolean;
  left: ReactNode;
  right?: ReactNode;
};

export const QuickSearchItemContent = ({
  alwaysShowRight = false,
  left,
  right,
}: QuickSearchItemContentProps) => {
  const { isDesktop } = useResponsiveStore();

  return (
    <div className="flex items-center justify-between w-full px-2 py-1">
      <div className="flex items-center gap-2 w-full">
        {left}
      </div>

      {isDesktop && right && (
        <div className={cn(
          "flex items-center",
          !alwaysShowRight && "show-right-on-focus"
        )}>
          {right}
        </div>
      )}
    </div>
  );
};

import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  showSeparator?: boolean;
  className?: string;
};

export const SeparatedSection = ({
  showSeparator = true,
  children,
  className,
}: PropsWithChildren<Props>) => {
  return (
    <div
      className={cn(
        'w-full py-4',
        showSeparator && 'border-b border-border',
        className
      )}
    >
      {children}
    </div>
  );
};

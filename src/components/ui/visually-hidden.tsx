'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      className={cn(
        'absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-[rect(0,0,0,0)] border-0',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
VisuallyHidden.displayName = 'VisuallyHidden';

export { VisuallyHidden };

import React from 'react';
import { useResponsiveStore } from '@/stores';

export function DocEditorSkeleton() {
  const { isDesktop } = useResponsiveStore();
  
  return (
    <div className="pl-64 max-md:pl-0 flex flex-col min-h-screen sm:mt-8" role="status" aria-busy="true">
      <main className="flex-1 overflow-y-auto">
        <div className="w-full flex justify-center">
          <div className={`px-${isDesktop ? '8' : '4'} pt-6 w-full max-w-4xl mx-auto`}>
            {/* Header skeleton: title + meta left, actions right */}
            <div className="mt-2 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="h-8 w-72 max-sm:w-56 rounded bg-muted animate-pulse" />
                <div className="h-4 w-64 max-sm:w-44 rounded bg-muted/80 animate-pulse" />
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <div className="h-8 w-20 rounded bg-muted animate-pulse" />
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse hidden sm:block" />
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse hidden sm:block" />
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              </div>
            </div>

            {/* Divider */}
            <div className="mt-4 h-px w-full bg-muted" />

            {/* Content skeleton lines */}
            <div className="mt-10 space-y-4">
              <div className="h-4 w-9/12 rounded bg-muted animate-pulse" />
              <div className="h-4 w-7/12 rounded bg-muted animate-pulse" />
              <div className="h-4 w-10/12 rounded bg-muted animate-pulse" />
              <div className="h-4 w-8/12 rounded bg-muted animate-pulse" />
              <div className="h-4 w-6/12 rounded bg-muted animate-pulse" />
              <div className="h-4 w-5/12 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



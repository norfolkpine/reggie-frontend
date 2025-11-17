import { QuickSearchItemContent } from '@/components/quick-search/';
import { Doc } from '@/features/docs/doc-management';
import { SimpleDocItem } from '@/features/docs/docs-grid/';
import { useResponsiveStore } from '@/stores';
import { cn } from '@/lib/utils';
import { ArrowDownLeftIcon } from 'lucide-react';

type DocSearchItemProps = {
  doc: Doc;
};

export const DocSearchItem = ({ doc }: DocSearchItemProps) => {
  const { isDesktop } = useResponsiveStore();
  return (
    <div
      data-testid={`doc-search-item-${doc.id}`}
      className={cn(
        "w-full",
        "--docs--doc-search-item"
      )}
    >
      <QuickSearchItemContent
        left={
          <div className={cn(
            "flex items-center gap-2.5 w-full",
            isDesktop ? "flex-[9]" : "flex-1"
          )}>
            <SimpleDocItem doc={doc} showAccesses />
          </div>
        }
        right={
          <ArrowDownLeftIcon className="text-primary-800" />
        }
      />
    </div>
  );
};

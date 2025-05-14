import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  QuickSearchData,
  QuickSearchGroup,
} from '@/components/quick-search';
import { Doc, useInfiniteDocs } from '@/features/docs/doc-management';
import { useResponsiveStore } from '@/stores';

import EmptySearchIcon from '../assets/illustration-docs-empty.png';

import { DocSearchItem } from './DocSearchItem';

type DocSearchModalProps = {
  onClose: () => void;
  isOpen: boolean;
};

export const DocSearchModal = ({ isOpen, onClose }: DocSearchModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { isDesktop } = useResponsiveStore();
  const {
    data,
    isFetching,
    isRefetching,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteDocs({
    page: 1,
    title: search,
  });
  const loading = isFetching || isRefetching || isLoading;
  const handleInputSearch = useDebouncedCallback(setSearch, 300);

  const handleSelect = (doc: Doc) => {
    router.push(`/docs/${doc.id}`);
    onClose?.();
  };

  const docsData: QuickSearchData<Doc> = useMemo(() => {
    const docs = data?.pages.flatMap((page) => page.results) || [];

    return {
      groupName: docs.length > 0 ? t('Select a document') : '',
      elements: search ? docs : [],
      emptyString: t('No document found'),
      endActions: hasNextPage
        ? [{ content: <InView onChange={() => void fetchNextPage()} /> }]
        : [],
    };
  }, [data, hasNextPage, fetchNextPage, t, search]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-3xl",
        isDesktop ? "h-[500px]" : "h-[calc(100vh-68px-1rem)]"
      )}>
        <div className="flex flex-col h-full" aria-label={t('Search modal')}>
          <Input
            placeholder={t('Type the name of a document')}
            onChange={(e) => handleInputSearch(e.target.value)}
            className="mb-4"
            disabled={loading}
          />
          
          <div className="flex-1 overflow-auto">
            {search.length === 0 && (
              <div className="flex flex-col h-full items-center justify-center">
                <Image
                  width={320}
                  src={EmptySearchIcon}
                  alt={t('No active search')}
                />
              </div>
            )}
            {search && (
              <QuickSearchGroup
                onSelect={handleSelect}
                group={docsData}
                renderElement={(doc) => <DocSearchItem doc={doc} />}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';

import { DocDefaultFilter, useInfiniteDocs } from '@/features/docs/doc-management';
import { useResponsiveStore } from '@/stores';

import { useResponsiveDocGrid } from '../hooks/useResponsiveDocGrid';

import { DocsGridItem } from './DocsGridItem';
import { DocsGridLoader } from './DocsGridLoader';

type DocsGridProps = {
  target?: DocDefaultFilter;
};

export const DocsGrid = ({
  target = DocDefaultFilter.ALL_DOCS,
}: DocsGridProps) => {
  const { t } = useTranslation();

  const { isDesktop } = useResponsiveStore();
  const { flexLeft, flexRight } = useResponsiveDocGrid();

  const {
    data,
    isFetching,
    isRefetching,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteDocs({
    page: 1,
    ...(target &&
      target !== DocDefaultFilter.ALL_DOCS && {
        is_creator_me: target === DocDefaultFilter.MY_DOCS,
      }),
  });
  const loading = isFetching || isLoading;
  const hasDocs = data?.pages.some((page) => page.results.length > 0);
  const loadMore = (inView: boolean) => {
    if (!inView || loading) {
      return;
    }
    void fetchNextPage();
  };

  const title =
    target === DocDefaultFilter.MY_DOCS
      ? t('My docs')
      : target === DocDefaultFilter.SHARED_WITH_ME
        ? t('Shared with me')
        : t('All docs');

  return (
    <div className="relative w-full max-w-[960px] max-h-[calc(100vh-52px-2rem)] flex items-center --docs--doc-grid">
      <DocsGridLoader isLoading={isRefetching || loading} />
      <Card
        role="grid"
        data-testid="docs-grid"
        className={`h-full w-full ${!isDesktop ? 'border-0' : ''} p-4 md:px-6 pb-6`}
      >
        <h4 className="text-xl font-bold mb-2.5">
          {title}
        </h4>

        {!hasDocs && !loading && (
          <div className="py-2 flex items-center justify-center">
            <p className="text-sm font-bold text-gray-600">
              {t('No documents found')}
            </p>
          </div>
        )}
        {hasDocs && (
          <div className="space-y-1.5 overflow-auto">
            <div
              className="flex flex-row px-2 space-x-2.5"
              data-testid="docs-grid-header"
            >
              <div className={`${flexLeft} p-1`}>
                <p className="text-xs font-medium text-gray-600">
                  {t('Name')}
                </p>
              </div>
              {isDesktop && (
                <div className={`${flexRight} py-1`}>
                  <p className="text-xs font-medium text-gray-600">
                    {t('Updated at')}
                  </p>
                </div>
              )}
            </div>

            {data?.pages.map((currentPage) => {
              return currentPage.results.map((doc) => (
                <DocsGridItem doc={doc} key={doc.id} />
              ));
            })}

            {hasNextPage && !loading && (
              <InView
                data-testid="infinite-scroll-trigger"
                as="div"
                onChange={loadMore}
              >
                {!isFetching && hasNextPage && (
                  <Button
                    onClick={() => void fetchNextPage()}
                    variant="ghost"
                  >
                    {t('More docs')}
                  </Button>
                )}
              </InView>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

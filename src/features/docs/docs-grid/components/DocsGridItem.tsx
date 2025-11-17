import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useModal } from '@openfun/cunningham-react';

import { Doc, LinkReach } from '@/features/docs/doc-management';
import { DocShareModal } from '@/features/docs/doc-share';
import { useResponsiveStore } from '@/stores';
import { useResponsiveDocGrid } from '../hooks/useResponsiveDocGrid';
import { DocsGridActions } from './DocsGridActions';
import { DocsGridItemSharedButton } from './DocsGridItemSharedButton';
import { SimpleDocItem } from './SimpleDocItem';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Globe, Lock } from 'lucide-react';
import Link from 'next/link';

type DocsGridItemProps = {
  doc: Doc;
};

export const DocsGridItem = ({ doc }: DocsGridItemProps) => {
  const { t } = useTranslation();
  const { isDesktop } = useResponsiveStore();
  const { flexLeft, flexRight } = useResponsiveDocGrid();
  const shareModal = useModal();
  const isPublic = doc.link_reach === LinkReach.PUBLIC;
  const isAuthenticated = doc.link_reach === LinkReach.AUTHENTICATED;
  const showAccesses = isPublic || isAuthenticated;

  const handleShareClick = () => {
    shareModal.open();
  };

  return (
    <>
      <div
        role="row"
        className={`flex w-full items-center gap-5 p-2 md:px-4 cursor-pointer rounded hover:bg-muted --docs--doc-grid-item`}
      >
        <Link
          href={`/docs/${doc.id}`}
          className={`flex-${flexLeft} flex items-center min-w-0`}
        >
          <div
            data-testid={`docs-grid-name-${doc.id}`}
            className={`flex items-center gap-2 flex-${flexLeft} pr-2 md:pr-4 max-w-full`}
          >
            <SimpleDocItem isPinned={doc.is_favorite} doc={doc} />
            {showAccesses && (
              <div className={`${!isDesktop ? 'pt-1 self-start' : ''}`}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {isPublic ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {isPublic
                        ? t('Accessible to anyone')
                        : t('Accessible to authenticated users')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </Link>

        <div
          className={`flex-${flexRight} flex items-center ${
            isDesktop ? 'justify-between' : 'justify-end'
          } gap-8`}
        >
          {isDesktop && (
            <Link href={`/docs/${doc.id}`}>
              <span className="text-sm text-muted-foreground">
                {DateTime.fromISO(doc.updated_at).toRelative()}
              </span>
            </Link>
          )}

          <div className="flex items-center gap-6">
            {isDesktop && (
              <DocsGridItemSharedButton
                doc={doc}
                handleClick={handleShareClick}
              />
            )}
            <DocsGridActions doc={doc} openShareModal={handleShareClick} />
          </div>
        </div>
      </div>
      {shareModal.isOpen && (
        <DocShareModal doc={doc} onClose={shareModal.close} open={shareModal.isOpen} />
      )}
    </>
  );
};

import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

import { Doc, useTrans } from '@/features/docs/doc-management';
import { useResponsiveStore } from '@/stores';

import PinnedDocumentIcon from '../assets/pinned-document.svg';
import SimpleFileIcon from '../assets/simple-document.svg';

type SimpleDocItemProps = {
  doc: Doc;
  isPinned?: boolean;
  showAccesses?: boolean;
};

export const SimpleDocItem = ({
  doc,
  isPinned = false,
  showAccesses = false,
}: SimpleDocItemProps) => {
  const { t } = useTranslation();
  const { isDesktop } = useResponsiveStore();
  const { untitledDocument } = useTrans();

  return (
    <div className="flex flex-row gap-2 overflow-auto --docs--simple-doc-item">
      <div className="flex flex-row items-center bg-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.05)]">
        {isPinned ? (
          <PinnedDocumentIcon aria-label={t('Pin document icon')} />
        ) : (
          <SimpleFileIcon aria-label={t('Simple document icon')} />
        )}
      </div>
      <div className="flex flex-col justify-center overflow-auto">
        <p
          aria-describedby="doc-title"
          aria-label={doc.title}
          className="text-sm font-medium text-foreground truncate"
        >
          {doc.title || untitledDocument}
        </p>
        {(!isDesktop || showAccesses) && (
          <div className="flex flex-row items-center gap-1 -mt-0.5">
            <span className="text-xs text-muted-foreground">
              {DateTime.fromISO(doc.updated_at).toRelative()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

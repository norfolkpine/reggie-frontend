import { Loader2 } from 'lucide-react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

import { APIError } from '@/api';
import { Doc } from '@/features/docs/doc-management';
import { useDate } from '@/hooks/useDate';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { useDocVersionsInfiniteQuery } from '../api/useDocVersions';
import { Versions } from '../types';

import { VersionItem } from './VersionItem';

interface VersionListStateProps {
  isLoading: boolean;
  error: APIError<unknown> | null;
  versions?: Versions[];
  doc: Doc;
  selectedVersionId?: Versions['version_id'];
  onSelectVersion?: (versionId: Versions['version_id']) => void;
}

const VersionListState = ({
  onSelectVersion,
  selectedVersionId,
  isLoading,
  error,
  versions,
  doc,
}: VersionListStateProps) => {
  const { formatDate } = useDate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {versions?.map((version) => (
        <button
          aria-label="version item"
          className="w-full"
          key={version.version_id}
          onClick={() => {
            onSelectVersion?.(version.version_id);
          }}
        >
          <VersionItem
            versionId={version.version_id}
            text={formatDate(version.last_modified, DateTime.DATETIME_MED)}
            docId={doc.id}
            isActive={version.version_id === selectedVersionId}
          />
        </button>
      ))}
      {error && (
        <Alert variant="destructive" className="m-2">
          <AlertDescription>
            {error.status === 502 ? (
              <div className="flex items-center gap-2">
                <span>No internet connection</span>
              </div>
            ) : (
              error.cause
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

interface VersionListProps {
  doc: Doc;
  onSelectVersion?: (versionId: Versions['version_id']) => void;
  selectedVersionId?: Versions['version_id'];
}

export const VersionList = ({
  doc,
  onSelectVersion,
  selectedVersionId,
}: VersionListProps) => {
  const { t } = useTranslation();

  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDocVersionsInfiniteQuery({
    docId: doc.id,
  });

  const versions = data?.pages.reduce((acc, page) => {
    return acc.concat(page.versions);
  }, [] as Versions[]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        {versions?.length === 0 && (
          <div className="flex items-center justify-center p-6">
            <h2 className="text-lg font-semibold">{t('No versions')}</h2>
          </div>
        )}
        <VersionListState
          onSelectVersion={onSelectVersion}
          isLoading={isLoading}
          error={error}
          versions={versions}
          doc={doc}
          selectedVersionId={selectedVersionId}
        />
        {hasNextPage && (
          <div className="flex justify-center p-4">
            <button
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium",
                "bg-muted hover:bg-muted/80",
                "disabled:opacity-50"
              )}
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('Load more')
              )}
            </button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

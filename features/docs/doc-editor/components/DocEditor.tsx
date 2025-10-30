import { Loader, Loader2, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { TextErrors } from '@/components/text-errors';
import { Box } from '@/components/ui/box';


import { DocHeader, DocVersionHeader } from '@/features/docs/doc-header/';
import {
  Doc,
  base64ToBlocknoteXmlFragment,
  useProviderStore,
} from '@/features/docs/doc-management';
import { TableContent } from '@/features/docs/doc-table-content/';
import { Versions, useDocVersion } from '@/features/docs/doc-versioning/';
import { useResponsiveStore } from '@/stores';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { BlockNoteEditor, BlockNoteEditorVersion } from './BlockNoteEditor';
import { DocEditorSkeleton } from './DocEditorSkeleton';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useModal } from '@/contexts/modal-context';
import { useHeader } from '@/contexts/header-context';
import { APIError } from '@/api/APIError';

interface DocEditorProps {
  doc?: Doc;
  versionId?: Versions['version_id'];
  isNew?: boolean;
  isError?: boolean;
  error?: APIError | null;
}

export const DocEditor = ({ doc = undefined, versionId, isNew = false, isError = false, error = null }: DocEditorProps) => {
  let isModalOpen = false;
  try {
    const { showModal, hideModal } = useModal();
    if (typeof window !== 'undefined') {
      isModalOpen = !!document.querySelector('.modal-open, [data-state="open"]');
    }
  } catch {
    isModalOpen = false;
  }

  const { isDesktop } = useResponsiveStore();
  const isVersion = !!versionId && typeof versionId === 'string';

  const { provider } = useProviderStore();
  const { t } = useTranslation();
  const router = useRouter();
  const { setHeaderActions, setHeaderCustomContent } = useHeader();

  // Set header breadcrumb navigation
  useEffect(() => {
    // Clear header actions since breadcrumb provides navigation
    setHeaderActions([]);

    // Set breadcrumb navigation
    setHeaderCustomContent(
      <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base lg:text-lg font-medium overflow-x-auto max-w-full scrollbar-thin">
        {/* Documents link */}
        <span
          className="hover:text-foreground font-medium cursor-pointer text-muted-foreground dark:hover:text-foreground dark:text-muted-foreground whitespace-nowrap flex-shrink-0"
          onClick={() => router.push('/documents')}
        >
          Documents
        </span>
        <span className="text-muted-foreground dark:text-muted-foreground/60 flex-shrink-0">/</span>

        {/* Document title */}
        <span
          className="text-foreground font-medium truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-none flex-shrink-0"
          title={doc?.title || 'Untitled'}
        >
          {doc?.title || 'Untitled'}
        </span>
      </div>
    );

    // Cleanup header when component unmounts
    return () => {
      setHeaderActions([]);
      setHeaderCustomContent(null);
    };
  }, [setHeaderActions, setHeaderCustomContent, router, doc?.title]);

  if(isError && error) {
    return (
      <div className="m-8">
        <TextErrors
          causes={error.cause}
          icon={error.status === 502 ? <WifiOff /> : undefined}
        />
      </div>
    );
  }

  if (!doc) {
    return (
      <DocEditorSkeleton />
    );
  }

  if (!provider) return null;

  return (
    <>
      <div className="pl-64 max-md:pl-0 flex flex-col min-h-screen">
        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
         
        <div className="w-full flex justify-center">
          <div 
            className={`px-${isDesktop ? '8' : '4'} pt-0 --docs--doc-editor-header w-full max-w-4xl mx-auto`}
          >
            {isVersion ? (
              <DocVersionHeader title={doc.title} />
            ) : (
              <DocHeader doc={doc} />
            )}
          </div>
        </div>

        <div className="w-full flex justify-center">
        <div
          className="--docs--doc-editor-content flex justify-center w-full bg-white"
        >
                      {isDesktop && !isVersion && (
              <Box
                $position="absolute"
                $zIndex="50"
                style={{
                  top: '72px',
                  right: '20px'
                }}
              >
                <TableContent />
              </Box>
            )}
            <div className="w-full max-w-4xl mx-auto px-4">
              {isVersion ? (
                <DocVersionEditor docId={doc.id} versionId={versionId} />
              ) : (
                <BlockNoteEditor doc={doc} provider={provider} isNew={isNew} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

interface DocVersionEditorProps {
  docId: Doc['id'];
  versionId: Versions['version_id'];
}

export const DocVersionEditor = ({
  docId,
  versionId,
}: DocVersionEditorProps) => {
  const {
    data: version,
    isLoading,
    isError,
    error,
  } = useDocVersion({ docId, versionId });

  const { replace } = useRouter();
  const [initialContent, setInitialContent] = useState<Y.XmlFragment>();

  useEffect(() => {
    if (version?.content) {
      setInitialContent(base64ToBlocknoteXmlFragment(version.content));
    }
  }, [version?.content]);

  if (isError && error) {
    if (error.status === 404) {
      void replace(`/404`);
      return null;
    }

    return (
      <div className="m-8 --docs--doc-version-editor-error">
        <Alert variant="destructive">
          {error.status === 502 && <AlertTriangle className="h-4 w-4" />}
          <AlertDescription>{error.cause}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || !version || !initialContent) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <BlockNoteEditorVersion initialContent={initialContent} />;
};

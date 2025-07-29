import { Loader } from '@openfun/cunningham-react';
import { useEffect, useState } from 'react';
import * as Y from 'yjs';

import { useCunninghamTheme } from '@/cunningham';
import { DocHeader, DocVersionHeader } from '@/features/docs/doc-header/';
import {
  Doc,
  base64ToBlocknoteXmlFragment,
  useProviderStore,
} from '@/features/docs/doc-management';
import { Versions, useDocVersion } from '@/features/docs/doc-versioning/';
import { useResponsiveStore } from '@/stores';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { BlockNoteEditor, BlockNoteEditorVersion } from './BlockNoteEditor';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useModal } from '@/contexts/modal-context';

interface DocEditorProps {
  doc: Doc;
  versionId?: Versions['version_id'];
  isNew?: boolean;
}

export const DocEditor = ({ doc, versionId, isNew = false }: DocEditorProps) => {
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
  const { colorsTokens } = useCunninghamTheme();
  const { provider } = useProviderStore();
  const { t } = useTranslation();
  const router = useRouter();

  if (!provider) return null;

  return (
    <div className="pl-64 max-md:pl-0 flex flex-col min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white border-b h-16 flex items-center px-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Back"
            className="rounded-full hover:bg-gray-100 p-2 transition-colors"
            onClick={() => router.push('/documents')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-xl font-medium">Document Editor</h1>
        </div>
      </header>

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
            className="--docs--doc-editor-content flex justify-center w-full"
            style={{ backgroundColor: colorsTokens['primary-bg'] }}
          >
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
        <Loader />
      </div>
    );
  }

  return <BlockNoteEditorVersion initialContent={initialContent} />;
};

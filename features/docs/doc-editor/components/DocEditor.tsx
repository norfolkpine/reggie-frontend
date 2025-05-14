import { Loader } from '@openfun/cunningham-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Y from 'yjs';

import { useCunninghamTheme } from '@/cunningham';
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

interface DocEditorProps {
  doc: Doc;
  versionId?: Versions['version_id'];
}

export const DocEditor = ({ doc, versionId }: DocEditorProps) => {
  const { isDesktop } = useResponsiveStore();
  const isVersion = !!versionId && typeof versionId === 'string';
  const { colorsTokens } = useCunninghamTheme();
  const { provider } = useProviderStore();

  if (!provider) {
    return null;
  }

  return (
    <>
      {isDesktop && !isVersion && (
        <div className="absolute top-[72px] right-5">
          <TableContent />
        </div>
      )}
      <div className="max-w-[868px] w-full h-full --docs--doc-editor">
        <div className={`px-${isDesktop ? '14' : '4'} --docs--doc-editor-header`}>
          {isVersion ? (
            <DocVersionHeader title={doc.title} />
          ) : (
            <DocHeader doc={doc} />
          )}
        </div>

        <div 
          className="bg-white flex flex-1 overflow-x-clip relative --docs--doc-editor-content"
          style={{ backgroundColor: colorsTokens['primary-bg'] }}
        >
          <div className="flex-1 relative w-full">
            {isVersion ? (
              <DocVersionEditor docId={doc.id} versionId={versionId} />
            ) : (
              <BlockNoteEditor doc={doc} provider={provider} />
            )}
          </div>
        </div>
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
  } = useDocVersion({
    docId,
    versionId,
  });

  const { replace } = useRouter();
  const [initialContent, setInitialContent] = useState<Y.XmlFragment>();

  useEffect(() => {
    if (!version?.content) {
      return;
    }

    setInitialContent(base64ToBlocknoteXmlFragment(version.content));
  }, [version?.content]);

  if (isError && error) {
    if (error.status === 404) {
      void replace(`/404`);
      return null;
    }

    return (
      <div className="m-8 --docs--doc-version-editor-error">
        <Alert variant="destructive">
          {error.status === 502 && (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>
            {error.cause}
          </AlertDescription>
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

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SaveIcon } from 'lucide-react';
import * as Y from 'yjs';

import {
  Doc,
  KEY_DOC,
  LinkReach,
  LinkRole,
  useCollaboration,
  useDocStore,
  useProviderStore,
} from '@/features/docs';
import { useBroadcastStore } from '@/stores';
import { NextPageWithLayout } from '@/types/next';
import { DocEditor } from '@/features/docs';
import { Button } from '@/components/ui/button';
import { createDocument } from '@/api/documents';
import { toBase64 } from '@/features/docs/doc-editor/utils';

export function NewDocLayout() {
  return (
    <div className="flex flex-col h-full w-full p-4">
      <NewDocPage />
    </div>
  );
}

const NewDocPage = () => {
  const [doc, setDoc] = useState<Doc>();
  const [isSaving, setIsSaving] = useState(false);
  const { setCurrentDoc } = useDocStore();
  const { addTask } = useBroadcastStore();
  const queryClient = useQueryClient();
  const { push } = useRouter();
  const { t } = useTranslation();

  // Initialize a new empty document
  useEffect(() => {
    const newDoc: Doc = {
      id: 'new',
      title: t('New Document'),
      content: '',
      creator: '',
      is_favorite: false,
      link_reach: LinkReach.RESTRICTED,
      link_role: LinkRole.EDITOR,
      nb_accesses_ancestors: 0,
      nb_accesses_direct: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      abilities: {
        accesses_manage: true,
        accesses_view: true,
        ai_transform: true,
        ai_translate: true,
        attachment_upload: true,
        children_create: true,
        children_list: true,
        collaboration_auth: true,
        destroy: true,
        favorite: true,
        invite_owner: true,
        link_configuration: true,
        media_auth: true,
        move: true,
        partial_update: true,
        restore: true,
        retrieve: true,
        update: true,
        versions_destroy: true,
        versions_list: true,
        versions_retrieve: true,
      },
    };

    setDoc(newDoc);
    setCurrentDoc(newDoc);
  }, [setCurrentDoc, t]);

  useEffect(() => {
    if (doc?.title) {
      setTimeout(() => {
        document.title = `${doc.title} - ${t('Docs')}`;
      }, 100);
    }
  }, [doc?.title, t]);

  // Set up collaboration for the new document
  useCollaboration(doc?.id, doc?.content);
  const { provider } = useProviderStore();

  /**
   * We add a broadcast task to reset the query cache
   * when the document visibility changes.
   */
  useEffect(() => {
    if (!doc?.id) {
      return;
    }

    addTask(`${KEY_DOC}-${doc.id}`, () => {
      void queryClient.resetQueries({
        queryKey: [KEY_DOC, { id: doc.id }],
      });
    });
  }, [addTask, doc?.id, queryClient]);

  const saveDocument = async () => {
    if (!doc || !provider) return;
    
    try {
      setIsSaving(true);
      
      // Get the document content from the provider
      const yDoc = provider.document;
      // Convert the document to Uint8Array using Y.encodeStateAsUpdate
      const content = Y.encodeStateAsUpdate(yDoc);
      // Use the toBase64 utility function to convert the Uint8Array to base64
      const base64Content = toBase64(content);
      
      // Use the createDocument API function to create the document
      const savedDoc = await createDocument({
        title: doc.title || t('New Document'),
        content: base64Content
      });
      
      // Navigate to the saved document
      push(`/documents/${savedDoc.id}`);
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!doc) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-gray-500">{t('Creating new document...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="absolute top-2 right-4 z-10">
        <Button 
          onClick={saveDocument} 
          disabled={isSaving}
          className="flex items-center gap-2"
          size="sm"
        >
          <SaveIcon className="h-4 w-4" />
          {isSaving ? t('Saving...') : t('Save')}
        </Button>
      </div>
      <DocEditor doc={doc} isNew={true} />
    </div>
  );
};

const Page: NextPageWithLayout = () => {
  return <NewDocLayout />;
};

Page.getLayout = function getLayout() {
  return <NewDocLayout />;
};

export default Page;

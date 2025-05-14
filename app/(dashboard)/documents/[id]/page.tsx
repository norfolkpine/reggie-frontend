'use client';

import { useQueryClient } from '@tanstack/react-query';
import Head from 'next/head';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

  import {
    Doc,
    KEY_DOC,
    useCollaboration,
    useDoc,
    useDocStore,
  } from '@/features/docs';
import { useBroadcastStore } from '@/stores';
import { NextPageWithLayout } from '@/types/next';
import { Loader, WifiOff } from 'lucide-react';
import { DocEditor } from '@/features/docs';
import { TextErrors } from '@/components/text-errors';

export function DocLayout() {
  const { id } = useParams();

  if (typeof id !== 'string') {
    return null;
  }

  return (
    <>
        <DocPage id={id} />
    </>
  );
}

interface DocProps {
  id: string;
}

const DocPage = ({ id }: DocProps) => {
  const {
    data: docQuery,
    isError,
    isFetching,
    error,
  } = useDoc(
    { id },
    {
      staleTime: 0,
      queryKey: [KEY_DOC, { id }],
    },
  );

  const [doc, setDoc] = useState<Doc>();
  const { setCurrentDoc } = useDocStore();
  const { addTask } = useBroadcastStore();
  const queryClient = useQueryClient();
  const { replace } = useRouter();
  useCollaboration(doc?.id, doc?.content);
  const { t } = useTranslation();

  useEffect(() => {
    if (doc?.title) {
      setTimeout(() => {
        document.title = `${doc.title} - ${t('Docs')}`;
      }, 100);
    }
  }, [doc?.title, t]);

  useEffect(() => {
    if (!docQuery || isFetching) {
      return;
    }

    setDoc(docQuery);
    setCurrentDoc(docQuery);
  }, [docQuery, setCurrentDoc, isFetching]);

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

  if (isError && error) {
    if (error.status === 403) {
      void replace(`/403`);
      return null;
    }

    if (error.status === 404) {
      void replace(`/404`);
      return null;
    }

    if (error.status === 401) {
      // void queryClient.resetQueries({
      //   queryKey: [KEY_AUTH],
      // });
      // setAuthUrl();
      // void replace(`/401`);
      // return null;
    }

    return (
      <div className='m-8'>
        <TextErrors
          causes={error.cause}
          icon={
            error.status === 502 ? (
              <WifiOff />
            ) : undefined
          }
        />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader />
      </div>
    );
  }

  return <DocEditor doc={doc} />;
};

const Page: NextPageWithLayout = () => {
  return <DocLayout />;
};

Page.getLayout = function getLayout() {
  return <DocLayout />;
};

export default Page;

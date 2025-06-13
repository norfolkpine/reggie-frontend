import { Loader } from '@openfun/cunningham-react';
import Head from 'next/head';
import { PropsWithChildren, useEffect } from 'react';

import { useCunninghamTheme } from '@/cunningham';
import { useLanguageSynchronizer } from '@/features/language/';
import { CrispProvider } from '@/services';

import { useConfig } from './api/useConfig';
import { Loader2 } from 'lucide-react';

export const ConfigProvider = ({ children }: PropsWithChildren) => {
  const { data: conf } = useConfig();
  const { setTheme } = useCunninghamTheme();
  const { synchronizeLanguage } = useLanguageSynchronizer();

  useEffect(() => {
    if (!conf?.FRONTEND_THEME) {
      return;
    }

    setTheme(conf.FRONTEND_THEME);
  }, [conf?.FRONTEND_THEME, setTheme]);

  useEffect(() => {
    void synchronizeLanguage();
  }, [synchronizeLanguage]);


  if (!conf) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader2 />
      </div>
    );
  }

  return (
    <>
      {conf?.FRONTEND_CSS_URL && (
        <Head>
          <link rel="stylesheet" href={conf?.FRONTEND_CSS_URL} />
        </Head>
      )}
        <CrispProvider websiteId={conf?.CRISP_WEBSITE_ID}>
          {children}
        </CrispProvider>
    </>
  );
};

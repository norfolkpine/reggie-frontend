import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

import { Doc, LinkReach, currentDocRole, useTrans } from '@/features/docs/doc-management';
import { useResponsiveStore } from '@/stores';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Globe, Lock } from 'lucide-react';

import { DocTitle } from './DocTitle';
import { DocToolBox } from './DocToolBox';

interface DocHeaderProps {
  doc: Doc;
}

export const DocHeader = ({ doc }: DocHeaderProps) => {
  const { isDesktop } = useResponsiveStore();
  const { t } = useTranslation();
  const docIsPublic = doc.link_reach === LinkReach.PUBLIC;
  const docIsAuth = doc.link_reach === LinkReach.AUTHENTICATED;
  const { transRole } = useTrans();

  return (
    <div 
      className={`w-full flex flex-col gap-4 pt-${isDesktop ? '16' : '4'}`}
      aria-label={t('It is the card information about the document.')}
    >
      {(docIsPublic || docIsAuth) && (
        <Badge 
          variant="outline"
          className="flex items-center gap-1 bg-primary-50 text-primary-800 border-primary-300"
          aria-label={t('Public document')}
        >
          {docIsPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          <span>
            {docIsPublic
              ? t('Public document')
              : t('Document accessible to any connected person')}
          </span>
        </Badge>
      )}
      
      <div className="flex flex-col w-full pb-2">
        <div className="flex justify-between items-center gap-2 max-w-full">
          <div className="flex flex-col gap-1 overflow-auto">
            <DocTitle doc={doc} />

            <div className="flex">
              {isDesktop ? (
                <>
                  <span className="text-sm font-semibold text-gray-600">
                    {transRole(currentDocRole(doc.abilities))}&nbsp;·&nbsp;
                  </span>
                  <span className="text-sm text-gray-600">
                    {t('Last update: {{update}}', {
                      update: DateTime.fromISO(doc.updated_at).toRelative(),
                    })}
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-400">
                  {DateTime.fromISO(doc.updated_at).toRelative()}
                </span>
              )}
            </div>
          </div>
          <DocToolBox doc={doc} />
        </div>
      </div>
      <Separator />
    </div>
  );
};
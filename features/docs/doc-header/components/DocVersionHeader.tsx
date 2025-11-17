import { useTranslation } from 'react-i18next';

import { Separator } from '@/components/ui/separator';
import { DocTitleText } from './DocTitle';

interface DocVersionHeaderProps {
  title?: string;
}

export const DocVersionHeader = ({ title }: DocVersionHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div 
      className="w-full py-4 space-y-4"
      aria-label={t('It is the document title')}
    >
      <DocTitleText title={title} />
      <Separator />
    </div>
  );
};

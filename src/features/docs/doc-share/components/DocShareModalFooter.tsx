import { useTranslation } from 'react-i18next';
import { Link } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Doc, useCopyDocLink } from '@/features/docs';

import { DocVisibility } from './DocVisibility';

type Props = {
  doc: Doc;
  onClose: () => void;
};

export const DocShareModalFooter = ({ doc, onClose }: Props) => {
  const copyDocLink = useCopyDocLink(doc.id);
  const { t } = useTranslation();

  return (
    <div className="flex-shrink-0">
      <Separator className="my-4" />
      
      <DocVisibility doc={doc} />
      <Separator className="my-4" />

      <div className="flex items-center justify-between px-6 pb-6">
        <Button
          variant="outline"
          onClick={copyDocLink}
          className="flex items-center gap-2"
        >
          <Link className="h-4 w-4" />
          {t('Copy link')}
        </Button>
        <Button onClick={onClose}>
          {t('OK')}
        </Button>
      </div>
    </div>
  );
};

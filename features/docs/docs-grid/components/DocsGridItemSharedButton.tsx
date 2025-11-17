import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

import { Doc } from '../../doc-management';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
  doc: Doc;
  handleClick: () => void;
};

export const DocsGridItemSharedButton = ({ doc, handleClick }: Props) => {
  const { t } = useTranslation();
  const sharedCount = doc.nb_accesses_direct;
  const isShared = sharedCount - 1 > 0;

  if (!isShared) {
    return <div className="min-w-[50px]">&nbsp;</div>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="min-w-[50px] justify-center"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleClick();
            }}
          >
            <Users className="h-4 w-4 text-primary mr-1" />
            {sharedCount}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {t('Shared with {{count}} users', { count: sharedCount })}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

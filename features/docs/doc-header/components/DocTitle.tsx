/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Doc,
  KEY_DOC,
  KEY_LIST_DOC,
  useTrans,
  useUpdateDoc,
} from '@/features/docs/doc-management';
import { useBroadcastStore, useResponsiveStore } from '@/stores';

interface DocTitleProps {
  doc: Doc;
}

export const DocTitle = ({ doc }: DocTitleProps) => {
  if (!doc.abilities.partial_update) {
    return <DocTitleText title={doc.title} />;
  }

  return <DocTitleInput doc={doc} />;
};

interface DocTitleTextProps {
  title?: string;
}

export const DocTitleText = ({ title }: DocTitleTextProps) => {
  const { isMobile } = useResponsiveStore();
  const { untitledDocument } = useTrans();

  // Previously: text-4xl for desktop, text-2xl for mobile
  return (
    <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'}`}>
      {title || untitledDocument}
    </h2>
  );
};

const DocTitleInput = ({ doc }: DocTitleProps) => {
  const { isDesktop } = useResponsiveStore();
  const { t } = useTranslation();
  const [titleDisplay, setTitleDisplay] = useState(doc.title);
  const { toast } = useToast();
  const { untitledDocument } = useTrans();
  const { broadcast } = useBroadcastStore();

  const { mutate: updateDoc } = useUpdateDoc({
    listInvalideQueries: [KEY_DOC, KEY_LIST_DOC],
    onSuccess(data) {
      toast({
        title: t('Document title updated successfully'),
        variant: "default",
      });

      broadcast(`${KEY_DOC}-${data.id}`);
    },
  });

  const handleTitleSubmit = useCallback(
    (inputText: string) => {
      let sanitizedTitle = inputText.trim();
      sanitizedTitle = sanitizedTitle.replace(/(\r\n|\n|\r)/gm, '');

      if (!sanitizedTitle) {
        setTitleDisplay('');
      }

      if (sanitizedTitle !== doc.title) {
        setTitleDisplay(sanitizedTitle);
        updateDoc({ id: doc.id, title: sanitizedTitle });
      }
    },
    [doc.id, doc.title, updateDoc],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSubmit(e.currentTarget.textContent || '');
    }
  };

  useEffect(() => {
    setTitleDisplay(doc.title);
  }, [doc]);

  // Previously: text-4xl for desktop, text-2xl for mobile
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="textbox"
            className={`--docs--doc-title-input min-h-[40px] pr-4  outline-none cursor-text ${isDesktop ? 'text-2xl' : 'text-lg'}
              before:content-[attr(data-placeholder)] before:text-gray-400 before:dark:text-white before:italic before:pointer-events-none
              empty:before:content-[attr(data-placeholder)]`}
            contentEditable
            data-placeholder={untitledDocument}
            onKeyDownCapture={handleKeyDown}
            suppressContentEditableWarning={true}
            aria-label="doc title input"
            onBlurCapture={(event: React.FocusEvent<HTMLSpanElement>) =>
              handleTitleSubmit(event.target.textContent || '')
            }
          >
            {titleDisplay}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('Rename')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

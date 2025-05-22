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

  return (
    <h2 className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'} text-gray-900`}>
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="textbox"
            className="--docs--doc-title-input min-h-[40px] pr-4 text-gray-900 font-bold outline-none cursor-text
              before:content-[attr(data-placeholder)] before:text-gray-400 before:italic before:pointer-events-none
              empty:before:content-[attr(data-placeholder)]"
            contentEditable
            data-placeholder={untitledDocument}
            onKeyDownCapture={handleKeyDown}
            suppressContentEditableWarning={true}
            aria-label="doc title input"
            onBlurCapture={(event: React.FocusEvent<HTMLSpanElement>) =>
              handleTitleSubmit(event.target.textContent || '')
            }
            style={{
              fontSize: isDesktop ? '2.25rem' : '1.5rem', // 4xl for desktop, 2xl for mobile
              fontWeight: 700,
              color: '#111827',
            }}
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

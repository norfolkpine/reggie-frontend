import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DocsBlockNoteEditor } from '@/features/docs';
import { useResponsiveStore } from '@/stores';

const leftPaddingMap: { [key: number]: string } = {
  3: 'pl-6',
  2: 'pl-4',
  1: 'pl-2',
};

export type HeadingsHighlight = {
  headingId: string;
  isVisible: boolean;
}[];

interface HeadingProps {
  editor: DocsBlockNoteEditor;
  level: number;
  text: string;
  headingId: string;
  isHighlight: boolean;
}

export const Heading = ({
  headingId,
  editor,
  isHighlight,
  level,
  text,
}: HeadingProps) => {
  const [isHover, setIsHover] = useState(isHighlight);
  const { isMobile } = useResponsiveStore();
  const isActive = isHighlight || isHover;

  return (
    <button
      id={`heading-${headingId}`}
      key={headingId}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => {
        if (!isMobile) {
          editor.focus();
        }

        editor.setTextCursorPosition(headingId, 'end');

        document.querySelector(`[data-id="${headingId}"]`)?.scrollIntoView({
          behavior: 'smooth',
          inline: 'start',
          block: 'start',
        });
      }}
      className={cn(
        'w-full rounded-md text-left transition-colors',
        isActive ? 'bg-muted' : 'bg-transparent',
        leftPaddingMap[level],
        'py-1',
        '--docs--table-content-heading'
      )}
    >
      <span
        className={cn(
          'w-full break-words transition-colors',
          isActive ? 'text-foreground' : 'text-muted-foreground',
          isHighlight ? 'font-bold' : 'font-normal'
        )}
        aria-selected={isHighlight}
      >
        {text}
      </span>
    </button>
  );
};

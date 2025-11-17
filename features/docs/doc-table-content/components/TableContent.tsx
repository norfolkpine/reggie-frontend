import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditorStore, useHeadingStore } from '@/features/docs';
import { Heading } from './Heading';
import { MAIN_LAYOUT_ID } from '@/lib/data/conf';
import { List, SquareMenuIcon } from 'lucide-react';

export const TableContent = () => {
  const { headings } = useHeadingStore();
  const { editor } = useEditorStore();

  const [headingIdHighlight, setHeadingIdHighlight] = useState<string>();
  const { t } = useTranslation();
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!headings) {
        return;
      }

      for (const heading of headings) {
        const elHeading = document.body.querySelector(
          `.bn-block-outer[data-id="${heading.id}"] [data-content-type="heading"]:first-child`,
        );

        if (!elHeading) {
          return;
        }

        const rect = elHeading.getBoundingClientRect();
        const isVisible =
          rect.top + rect.height >= 1 &&
          rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight);

        if (isVisible) {
          setHeadingIdHighlight(heading.id);
          break;
        }
      }
    };

    let timeout: NodeJS.Timeout;
    const scrollFn = () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        handleScroll();
      }, 300);
    };

    document
      .getElementById(MAIN_LAYOUT_ID)
      ?.addEventListener('scroll', scrollFn);

    handleScroll();

    return () => {
      document
        .getElementById(MAIN_LAYOUT_ID)
        ?.removeEventListener('scroll', scrollFn);
    };
  }, [headings, setHeadingIdHighlight]);

  const onOpen = () => {
    setIsHover(true);
    setTimeout(() => {
      const element = document.getElementById(`heading-${headingIdHighlight}`);

      element?.scrollIntoView({
        behavior: 'instant',
        inline: 'center',
        block: 'center',
      });
    }, 0);
  };

  const onClose = () => {
    setIsHover(false);
  };

  if (
    !editor ||
    !headings ||
    headings.length === 0 ||
    (headings.length === 1 && !headings[0].contentText)
  ) {
    return null;
  }

  // Removed transition animation by commenting out 'transition-all duration-300' below:
  return (
    <div
      id="summaryContainer"
      className={cn(
        // 'transition-all duration-300', // <-- Animation removed
        'fixed right-4 top-20 z-[1000] border rounded-md bg-background',
        isHover ? 'w-[200px] h-auto max-h-[calc(50vh-60px)]' : 'w-10 h-10',
        'flex items-center justify-center p-2 overflow-hidden'
      )}
    >
      {!isHover && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpen}
          className="w-full h-full flex items-center justify-center"
        >
          <List className="h-4 w-4" />
        </Button>
      )}
      {isHover && (
        <div className="w-full h-full flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-medium">{t('Summary')}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rotate-180"
            >
              <SquareMenuIcon className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-1">
              {headings?.map(
                (heading) =>
                  heading.contentText && (
                    <Heading
                      editor={editor}
                      headingId={heading.id}
                      level={heading.props.level}
                      text={heading.contentText}
                      key={heading.id}
                      isHighlight={headingIdHighlight === heading.id}
                    />
                  ),
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

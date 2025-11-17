import { defaultProps, insertOrUpdateBlock } from '@blocknote/core';
import { BlockTypeSelectItem, createReactBlockSpec } from '@blocknote/react';
import { TFunction } from 'i18next';
import { Quote } from 'lucide-react';

import { DocsBlockNoteEditor } from '../../types';

export const QuoteBlock = createReactBlockSpec(
  {
    type: 'quote',
    propSchema: {
      textAlignment: defaultProps.textAlignment,
    },
    content: 'inline',
  },
  {
    render: (props) => {
      return (
        <blockquote
          className="inline-content my-4 pl-4 border-l-4 border-gray-300 italic text-gray-500 flex-grow"
          ref={props.contentRef}
        />
      );
    },
  },
);

export const getQuoteReactSlashMenuItems = (
  editor: DocsBlockNoteEditor,
  t: TFunction<'translation', undefined>,
  group: string,
) => [
  {
    title: t('Quote'),
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: 'quote',
      });
    },
    aliases: ['quote', 'blockquote', 'citation'],
    group,
    icon: <Quote className="h-4 w-4" />,
    subtext: t('Add a quote block'),
  },
];

export const getQuoteFormattingToolbarItems = (
  t: TFunction<'translation', undefined>,
): BlockTypeSelectItem => ({
  name: t('Quote'),
  type: 'quote',
  icon: () => <Quote className="h-4 w-4" />,
  isSelected: (block) => block.type === 'quote',
});

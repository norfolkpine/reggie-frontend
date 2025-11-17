import { insertOrUpdateBlock } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { TFunction } from 'i18next';
import { Minus } from 'lucide-react';

import { DocsBlockNoteEditor } from '../../types';

export const DividerBlock = createReactBlockSpec(
  {
    type: 'divider',
    propSchema: {},
    content: 'none',
  },
  {
    render: () => {
      return (
        <hr className="w-full my-4 border-t border-gray-300" />
      );
    },
  },
);

export const getDividerReactSlashMenuItems = (
  editor: DocsBlockNoteEditor,
  t: TFunction<'translation', undefined>,
  group: string,
) => [
  {
    title: t('Divider'),
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: 'divider',
      });
    },
    aliases: ['divider', 'hr', 'horizontal rule', 'line', 'separator'],
    group,
    icon: <Minus className="h-4 w-4" />,
    subtext: t('Add a horizontal line'),
  },
];

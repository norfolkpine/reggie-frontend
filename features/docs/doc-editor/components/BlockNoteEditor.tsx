import {
  BlockNoteSchema,
  Dictionary,
  defaultBlockSpecs,
  withPageBreak,
} from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Y from 'yjs';

import { Doc } from '@/features/docs/doc-management';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

import { useUploadFile } from '../hook';
import { useHeadings } from '../hook/useHeadings';
import useSaveDoc from '../hook/useSaveDoc';
import { useEditorStore } from '../stores';
import { randomColor } from '../utils';

import { BlockNoteSuggestionMenu } from './BlockNoteSuggestionMenu';
import { BlockNoteToolbar } from './BlockNoteToolBar/BlockNoteToolbar';
import { DividerBlock, QuoteBlock } from './custom-blocks';
import { useAuth } from '@/contexts/auth-context';

export const blockNoteSchema = withPageBreak(
  BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      divider: DividerBlock,
      quote: QuoteBlock,
    },
  })
);

interface BlockNoteEditorProps {
  doc: Doc;
  provider: HocuspocusProvider;
  isNew?: boolean;
}

export const BlockNoteEditor = ({
  doc,
  provider,
  isNew = false,
}: BlockNoteEditorProps) => {
  const { user } = useAuth();
  const { setEditor } = useEditorStore();
  const { t } = useTranslation();

  const readOnly = !doc.abilities.partial_update;
  useSaveDoc(doc.id, provider.document, !readOnly);
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

  const { uploadFile, errorAttachment } = useUploadFile(doc.id);

  const collabName = readOnly
    ? 'Reader'
    : user?.first_name || user?.email || t('Anonymous');
  const showCursorLabels: 'always' | 'activity' | (string & {}) = 'activity';

  const editor = useCreateBlockNote(
    {
      collaboration: {
        provider,
        fragment: provider.document.getXmlFragment('document-store'),
        user: {
          name: collabName,
          color: randomColor(),
        },
        renderCursor: (user: { color: string; name: string }) => {
          const cursorElement = document.createElement('span');

          if (user.name === 'Reader') {
            return cursorElement;
          }

          cursorElement.classList.add('collaboration-cursor-custom__base');
          const caretElement = document.createElement('span');
          caretElement.classList.add('collaboration-cursor-custom__caret');
          caretElement.setAttribute('spellcheck', `false`);
          caretElement.setAttribute('style', `background-color: ${user.color}`);

          if (showCursorLabels === 'always') {
            cursorElement.setAttribute('data-active', '');
          }

          const labelElement = document.createElement('span');

          labelElement.classList.add('collaboration-cursor-custom__label');
          labelElement.setAttribute('spellcheck', `false`);
          labelElement.setAttribute(
            'style',
            `background-color: ${user.color};border: 1px solid ${user.color};`
          );
          labelElement.insertBefore(document.createTextNode(user.name), null);

          caretElement.insertBefore(labelElement, null);

          cursorElement.insertBefore(document.createTextNode('\u2060'), null);
          cursorElement.insertBefore(caretElement, null);
          cursorElement.insertBefore(document.createTextNode('\u2060'), null);

          return cursorElement;
        },
        showCursorLabels: showCursorLabels as 'always' | 'activity',
      },
      uploadFile,
      schema: blockNoteSchema,
    },
    [collabName, lang, provider, uploadFile]
  );
  useHeadings(editor);

  useEffect(() => {
    setEditor(editor);

    return () => {
      setEditor(undefined);
    };
  }, [setEditor, editor]);

  return (
    <div
      className={`pt-4 px-6 bg-white ${
        readOnly ? 'pointer-events-none' : ''
      } --docs--editor-container`}
    >
      {errorAttachment && (
        <div className="mb-6 mx-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorAttachment.cause}</AlertDescription>
          </Alert>
        </div>
      )}

      <BlockNoteView
        editor={editor}
        formattingToolbar={false}
        slashMenu={false}
        editable={!readOnly}
        theme="light"
        className={`min-h-[300px] ${
          isNew
            ? 'focus-within:ring-2 focus-within:ring-primary-300 focus-within:ring-opacity-50'
            : ''
        }`}
      >
        <BlockNoteSuggestionMenu />
        <BlockNoteToolbar />
      </BlockNoteView>
    </div>
  );
};

interface BlockNoteEditorVersionProps {
  initialContent: Y.XmlFragment;
}

export const BlockNoteEditorVersion = ({
  initialContent,
}: BlockNoteEditorVersionProps) => {
  const readOnly = true;
  const { setEditor } = useEditorStore();
  const editor = useCreateBlockNote(
    {
      collaboration: {
        fragment: initialContent,
        user: {
          name: '',
          color: '',
        },
        provider: undefined,
      },
      schema: blockNoteSchema,
    },
    [initialContent]
  );
  useHeadings(editor);

  useEffect(() => {
    setEditor(editor);

    return () => {
      setEditor(undefined);
    };
  }, [setEditor, editor]);

  return (
    <div className={`pointer-events-none --docs--editor-container`}>
      <BlockNoteView editor={editor} editable={!readOnly} theme="light" />
    </div>
  );
};

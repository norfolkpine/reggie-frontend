import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Share2, Download, Link2, Pin, History, Copy, Trash2 } from 'lucide-react';
import { useEditorStore } from '@/features/docs/doc-editor/';
import { ModalExport } from '@/features/docs/doc-export/';
import {
  Doc,
  KEY_DOC,
  KEY_LIST_DOC,
  useCopyDocLink,
  useCreateFavoriteDoc,
  useDeleteFavoriteDoc,
} from '@/features/docs/doc-management';
import { DeleteDocumentDialog } from '@/components/doc/DeleteDocumentDialog';
import { DocShareModal } from '@/features/docs/doc-share';
import {
  KEY_LIST_DOC_VERSIONS,
  ModalSelectVersion,
} from '@/features/docs/doc-versioning';
import { useResponsiveStore } from '@/stores';

interface DocToolBoxProps {
  doc: Doc;
}

export const DocToolBox = ({ doc }: DocToolBoxProps) => {
  const { t } = useTranslation();
  const hasAccesses = doc.nb_accesses_direct > 1 && doc.abilities.accesses_view;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isModalRemoveOpen, setIsModalRemoveOpen] = useState(false);
  const [isModalExportOpen, setIsModalExportOpen] = useState(false);
  const [isSelectHistoryOpen, setIsSelectHistoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { isSmallMobile, isDesktop } = useResponsiveStore();
  const { editor } = useEditorStore();
  const copyDocLink = useCopyDocLink(doc.id);
  const removeFavoriteDoc = useDeleteFavoriteDoc({
    listInvalideQueries: [KEY_LIST_DOC, KEY_DOC],
  });
  const makeFavoriteDoc = useCreateFavoriteDoc({
    listInvalideQueries: [KEY_LIST_DOC, KEY_DOC],
  });

  const copyCurrentEditorToClipboard = async (asFormat: 'html' | 'markdown') => {
    if (!editor) {
      toast({
        title: t('Editor unavailable'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const editorContentFormatted =
        asFormat === 'html'
          ? await editor.blocksToHTMLLossy()
          : await editor.blocksToMarkdownLossy();
      await navigator.clipboard.writeText(editorContentFormatted);
      toast({
        title: t('Copied to clipboard'),
        variant: 'default',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t('Failed to copy to clipboard'),
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isSelectHistoryOpen) {
      return;
    }

    void queryClient.resetQueries({
      queryKey: [KEY_LIST_DOC_VERSIONS],
    });
  }, [isSelectHistoryOpen, queryClient]);

  return (
    <div className="ml-auto flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 ml-auto">
        {!isSmallMobile && (
          <>
            {!hasAccesses && (
              <Button
                variant="ghost"
                onClick={() => setIsShareOpen(true)}
                size={isSmallMobile ? 'sm' : 'default'}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {t('Share')}
              </Button>
            )}
            {hasAccesses && (
              <Button
                variant="outline"
                onClick={() => setIsShareOpen(true)}
                size={isSmallMobile ? 'sm' : 'default'}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {doc.nb_accesses_direct}
              </Button>
            )}
          </>
        )}

        {!isSmallMobile && (
          <Button
            variant="ghost"
            size={isSmallMobile ? 'sm' : 'default'}
            onClick={() => setIsModalExportOpen(true)}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isSmallMobile && (
              <>
                <DropdownMenuItem onClick={() => setIsShareOpen(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('Share')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsModalExportOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('Export')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyDocLink}>
                  <Link2 className="h-4 w-4 mr-2" />
                  {t('Copy link')}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={() => {
                if (doc.is_favorite) {
                  removeFavoriteDoc.mutate({ id: doc.id });
                } else {
                  makeFavoriteDoc.mutate({ id: doc.id });
                }
              }}
            >
              <Pin className="h-4 w-4 mr-2" />
              {doc.is_favorite ? t('Unpin') : t('Pin')}
            </DropdownMenuItem>
            {doc.abilities.versions_list && (
              <DropdownMenuItem onClick={() => {
                console.log('open history dialog');
                setIsSelectHistoryOpen(true)
              }}>
                <History className="h-4 w-4 mr-2" />
                {t('Version history')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => copyCurrentEditorToClipboard('markdown')}>
              <Copy className="h-4 w-4 mr-2" />
              {t('Copy as {{format}}', { format: 'Markdown' })}
            </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyCurrentEditorToClipboard('html')}>
                <Copy className="h-4 w-4 mr-2" />
                {t('Copy as {{format}}', { format: 'HTML' })}
              </DropdownMenuItem>
            {doc.abilities.destroy && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsModalRemoveOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('Delete document')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DocShareModal onClose={() => setIsShareOpen(false)} doc={doc} open={isShareOpen} />


      <ModalExport onClose={() => setIsModalExportOpen(false)} doc={doc} open={isModalExportOpen} />

      <DeleteDocumentDialog 
        open={isModalRemoveOpen} 
        doc={doc} 
        onClose={() => setIsModalRemoveOpen(false)} 
      />

<ModalSelectVersion onClose={() => setIsSelectHistoryOpen(false)} doc={doc} open={isSelectHistoryOpen} />;
    </div>
  );
};

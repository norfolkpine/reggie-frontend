import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Pin, Share2, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Doc,
  KEY_LIST_DOC,
  ModalRemoveDoc,
  useCreateFavoriteDoc,
  useDeleteFavoriteDoc,
} from '@/features/docs/doc-management';
import { useState } from 'react';

interface DocsGridActionsProps {
  doc: Doc;
  openShareModal?: () => void;
}

export const DocsGridActions = ({
  doc,
  openShareModal,
}: DocsGridActionsProps) => {
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const removeFavoriteDoc = useDeleteFavoriteDoc({
    listInvalideQueries: [KEY_LIST_DOC],
  });
  const makeFavoriteDoc = useCreateFavoriteDoc({
    listInvalideQueries: [KEY_LIST_DOC],
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            data-testid={`docs-grid-actions-button-${doc.id}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              if (doc.is_favorite) {
                removeFavoriteDoc.mutate({ id: doc.id });
              } else {
                makeFavoriteDoc.mutate({ id: doc.id });
              }
            }}
            data-testid={`docs-grid-actions-${doc.is_favorite ? 'unpin' : 'pin'}-${doc.id}`}
          >
            <Pin className="mr-2 h-4 w-4" />
            {doc.is_favorite ? t('Unpin') : t('Pin')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => openShareModal?.()}
            data-testid={`docs-grid-actions-share-${doc.id}`}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t('Share')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={!doc.abilities.destroy}
            data-testid={`docs-grid-actions-remove-${doc.id}`}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('Remove')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isDeleteModalOpen && (
        <ModalRemoveDoc onClose={() => setIsDeleteModalOpen(false)} doc={doc} />
      )}
    </>
  );
};

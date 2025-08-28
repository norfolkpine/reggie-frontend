import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { t } from 'i18next';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRemoveDoc } from '@/features/docs/doc-management/api/useRemoveDoc';
import { Doc } from '@/features/docs/doc-management/types';

interface DeleteDocumentDialogProps {
  open: boolean;
  doc: Doc;
  onClose: () => void;
}

export const DeleteDocumentDialog: React.FC<DeleteDocumentDialogProps> = ({
  open,
  doc,
  onClose,
}) => {
  const { toast } = useToast();
  const { push } = useRouter();
  const pathname = usePathname();

  const {
    mutate: removeDoc,
    isError,
    error,
    isPending,
  } = useRemoveDoc({
    onSuccess: () => {
      toast({
        title: t('The document has been deleted.'),
        variant: "default",
      });
      if (pathname === '/') {
        onClose();
      } else if (pathname.startsWith('/documents/')) {
        // If we're on a document page, redirect to documents list
        void push('/documents');
      } else {
        // For other pages, redirect to documents list as well
        void push('/documents');
      }
    },
  });

  const handleDelete = () => {
    removeDoc({ docId: doc.id });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t('Delete a doc')}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {!isError && (
            <p className="text-sm text-muted-foreground">
              {t('Are you sure you want to delete this document ?')}
            </p>
          )}
          {isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {error?.cause || t('An error occurred while deleting the document.')}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            aria-label={t('Close the modal')}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            aria-label={t('Confirm deletion')}
          >
            {isPending ? t('Deleting...') : t('Delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDocumentDialog;

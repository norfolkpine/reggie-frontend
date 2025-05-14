import { useToast } from "@/components/ui/use-toast";
import { t } from 'i18next';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { useRemoveDoc } from '../api/useRemoveDoc';
import { Doc } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ModalRemoveDocProps {
  onClose: () => void;
  doc: Doc;
}

export const ModalRemoveDoc = ({ onClose, doc }: ModalRemoveDocProps) => {
  const { toast } = useToast();
  const { push } = useRouter();
  const pathname = usePathname();

  const {
    mutate: removeDoc,
    isError,
    error,
  } = useRemoveDoc({
    onSuccess: () => {
      toast({
        title: t('The document has been deleted.'),
        variant: "default",
      });
      if (pathname === '/') {
        onClose();
      } else {
        void push('/');
      }
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
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
                {error.cause}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            aria-label={t('Close the modal')}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => removeDoc({ docId: doc.id })}
            aria-label={t('Confirm deletion')}
          >
            {t('Delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

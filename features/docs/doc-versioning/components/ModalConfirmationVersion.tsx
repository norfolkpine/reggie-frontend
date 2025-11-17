import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Doc,
  base64ToYDoc,
  useProviderStore,
  useUpdateDoc,
} from '@/features/docs';

import { useDocVersion } from '../api';
import { KEY_LIST_DOC_VERSIONS } from '../api/useDocVersions';
import { Versions } from '../types';
import { revertUpdate } from '../utils';

interface ModalConfirmationVersionProps {
  onClose: () => void;
  docId: Doc['id'];
  versionId: Versions['version_id'];
}

export const ModalConfirmationVersion = ({
  onClose,
  docId,
  versionId,
}: ModalConfirmationVersionProps) => {
  const { data: version } = useDocVersion({
    docId,
    versionId,
  });
  const { t } = useTranslation();
  const { toast } = useToast();
  const { push } = useRouter();
  const { provider } = useProviderStore();
  const { mutate: updateDoc } = useUpdateDoc({
    listInvalideQueries: [KEY_LIST_DOC_VERSIONS],
    onSuccess: () => {
      const onDisplaySuccess = () => {
        toast({
          title: t('Version restored successfully'),
        });
        void push(`/docs/${docId}`);
      };

      if (!provider || !version?.content) {
        onDisplaySuccess();
        return;
      }

      revertUpdate(
        provider.document,
        provider.document,
        base64ToYDoc(version.content),
      );

      onDisplaySuccess();
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t('Warning')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {t('Your current document will revert to this version.')}
          </p>
          <p className="text-muted-foreground">
            {t('If a member is editing, his works can be lost.')}
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!version?.content) {
                return;
              }

              updateDoc({
                id: docId,
                content: version.content,
              });

              onClose();
            }}
            className="w-full sm:w-auto"
          >
            {t('Restore')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

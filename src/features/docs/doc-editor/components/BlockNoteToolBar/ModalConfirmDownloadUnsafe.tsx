import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ModalConfirmDownloadUnsafeProps {
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
}

export const ModalConfirmDownloadUnsafe = ({
  onConfirm,
  onClose,
}: ModalConfirmDownloadUnsafeProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {t('Warning')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <p className="text-sm font-medium text-gray-900">
            {t('This file is flagged as unsafe.')}
          </p>
          <p className="text-sm text-gray-500">
            {t('Please download it only if it comes from a trusted source.')}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button 
            variant="destructive"
            onClick={() => {
              if (onConfirm) {
                void onConfirm();
              }
              onClose();
            }}
          >
            {t('Download anyway')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

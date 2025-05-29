import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

import { DocEditor } from '@/features/docs';
import { Doc } from '@/features/docs';
import { Versions } from '../types';
import { ModalConfirmationVersion } from './ModalConfirmationVersion';
import { VersionList } from './VersionList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ModalSelectVersionProps = {
  doc: Doc;
  onClose: () => void;
};

export const ModalSelectVersion = ({
  onClose,
  doc,
}: ModalSelectVersionProps) => {
  const { t } = useTranslation();
  const [selectedVersionId, setSelectedVersionId] = useState<Versions['version_id']>();
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const canRestore = doc.abilities.partial_update;

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-[90vw] h-[90vh] p-0">
          <div className="flex h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="w-full p-6">
                {selectedVersionId && (
                  <DocEditor doc={doc} versionId={selectedVersionId} />
                )}
                {!selectedVersionId && (
                  <div className="flex items-center justify-center h-full">
                    <h2 className="text-lg font-semibold">
                      {t('Select a version on the right to restore')}
                    </h2>
                  </div>
                )}
              </div>
            </div>
            <div className="w-[250px] h-full flex flex-col border-l">
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-between p-2 border-b">
                  <h2 className="text-lg font-semibold">{t('History')}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <VersionList
                  doc={doc}
                  onSelectVersion={setSelectedVersionId}
                  selectedVersionId={selectedVersionId}
                />
              </div>
              {canRestore && (
                <div className="p-2 border-t">
                  <Button
                    className="w-full"
                    disabled={!selectedVersionId}
                    onClick={() => setIsRestoreModalOpen(true)}
                  >
                    {t('Restore')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {isRestoreModalOpen && selectedVersionId && (
        <ModalConfirmationVersion
          onClose={() => {
            setIsRestoreModalOpen(false);
            onClose();
            setSelectedVersionId(undefined);
          }}
          docId={doc.id}
          versionId={selectedVersionId}
        />
      )}
    </>
  );
};

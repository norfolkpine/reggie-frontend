import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";

import { DocEditor } from "@/features/docs";
import { Doc } from "@/features/docs";
import { Versions } from "../types";
import { ModalConfirmationVersion } from "./ModalConfirmationVersion";
import { VersionList } from "./VersionList";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ModalSelectVersionProps = {
  doc: Doc;
  onClose: () => void;
};

export const ModalSelectVersion = ({ onClose, doc }: ModalSelectVersionProps) => {
  const { t } = useTranslation();
  const [selectedVersionId, setSelectedVersionId] = useState<Versions["version_id"] | undefined>();
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const canRestore = doc.abilities.partial_update;

  return (
    <>
      <Dialog
        open={true}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        {/* Narrower & shorter dialog */}
        <DialogContent className="max-w-[60vw] max-w-4xl h-[75vh] p-0">
          <DialogHeader className="px-6 py-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {t("Select a version to restore")}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("Preview and restore previous versions of this document")}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Layout: editor + thin history rail */}
          <div className="grid grid-cols-[1fr_220px] h-[calc(75vh-52px)] min-h-0">
            {/* Left: preview/editor */}
            <div className="overflow-y-auto min-h-0">
              <div className="w-full p-5">
                {selectedVersionId ? (
                  <DocEditor doc={doc} versionId={selectedVersionId} />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <h2 className="text-sm font-medium text-muted-foreground">
                      {t("Select a version on the right to restore")}
                    </h2>
                  </div>
                )}
              </div>
            </div>

            {/* Right: versions rail */}
            <aside className="h-full flex flex-col border-l bg-background">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <h3 className="text-sm font-semibold">{t("History")}</h3>
                {/* Removed extra close button to avoid duplicate X */}
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
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
                    {t("Restore")}
                  </Button>
                </div>
              )}
            </aside>
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

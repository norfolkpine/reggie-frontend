import { useState } from 'react';
import { Doc } from '@/features/docs/doc-management';
import { Versions } from '../types';
import { ModalConfirmationVersion } from './ModalConfirmationVersion';
import { cn } from '@/lib/utils';

interface VersionItemProps {
  docId: Doc['id'];
  text: string;
  versionId?: Versions['version_id'];
  isActive: boolean;
}

export const VersionItem = ({
  docId,
  versionId,
  text,
  isActive,
}: VersionItemProps) => {
  const [isModalVersionOpen, setIsModalVersionOpen] = useState(false);

  return (
    <>
      <li
        className={cn(
          "w-full min-w-[13rem] cursor-pointer rounded-sm transition-colors",
          "hover:bg-muted",
          isActive && "bg-muted"
        )}
      >
        <div className="flex w-full items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">
              {text}
            </span>
          </div>
        </div>
      </li>
      {isModalVersionOpen && versionId && (
        <ModalConfirmationVersion
          onClose={() => setIsModalVersionOpen(false)}
          docId={docId}
          versionId={versionId}
        />
      )}
    </>
  );
};

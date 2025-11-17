import { useTranslation } from 'react-i18next';
import { useToast } from "@/components/ui/use-toast";
import { Access, Doc, Role } from '@/features/docs/doc-management';
import { useResponsiveStore } from '@/stores';
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDeleteDocAccess, useUpdateDocAccess } from '../api';
import { useWhoAmI } from '../hooks/';

import { DocRoleDropdown } from './DocRoleDropdown';
import { SearchUserRow } from './SearchUserRow';

type Props = {
  doc: Doc;
  access: Access;
};

export const DocShareMemberItem = ({ doc, access }: Props) => {
  const { t } = useTranslation();
  const { isLastOwner, isOtherOwner } = useWhoAmI(access);
  const { toast } = useToast();
  const { isDesktop } = useResponsiveStore();
  const isNotAllowed =
    isOtherOwner || !!isLastOwner || !doc.abilities.accesses_manage;

  const { mutate: updateDocAccess } = useUpdateDocAccess({
    onError: () => {
      toast({
        variant: "destructive",
        title: t('Error during invitation update'),
        duration: 4000,
      });
    },
  });

  const { mutate: removeDocAccess } = useDeleteDocAccess({
    onError: () => {
      toast({
        variant: "destructive",
        title: t('Error while deleting invitation'),
        duration: 4000,
      });
    },
  });

  const onUpdate = (newRole: Role) => {
    updateDocAccess({
      docId: doc.id,
      role: newRole,
      accessId: access.id,
    });
  };

  const onRemove = () => {
    removeDocAccess({ accessId: access.id, docId: doc.id });
  };

  return (
    <div
      data-testid={`doc-share-member-row-${access.user.email}`}
      className="w-full"
    >
      <SearchUserRow
        alwaysShowRight={true}
        user={access.user}
        right={
          <div className="flex items-center gap-2">
            <DocRoleDropdown
              currentRole={access.role}
              onSelectRole={onUpdate}
              canUpdate={doc.abilities.accesses_manage}
              isLastOwner={isLastOwner}
              isOtherOwner={!!isOtherOwner}
            />

            {isDesktop && doc.abilities.accesses_manage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={onRemove}
                    disabled={isNotAllowed}
                    className="text-destructive"
                  >
                    {t('Delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />
    </div>
  );
};

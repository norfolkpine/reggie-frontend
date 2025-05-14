import { useTranslation } from 'react-i18next';
import { useToast } from "@/components/ui/use-toast";
import { Doc, Role } from '@/features/docs/doc-management';
import { User } from '@/types/api';
import { useDeleteDocInvitation, useUpdateDocInvitation } from '../api';
import { Invitation } from '../types';
import { DocRoleDropdown } from './DocRoleDropdown';
import { SearchUserRow } from './SearchUserRow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  doc: Doc;
  invitation: Invitation;
};

export const DocShareInvitationItem = ({ doc, invitation }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fakeUser: User = {
    id: invitation.id ?? 0,
    first_name: invitation.email,
    last_name: invitation.email,
    email: invitation.email,
    get_display_name: invitation.email,
    language: 'en-us',
    is_active: false,
    avatar_url: '',
    created_at: '',
    updated_at: ''
  };

  const canUpdate = doc.abilities.accesses_manage;

  const { mutate: updateDocInvitation } = useUpdateDocInvitation({
    onError: (error) => {
      toast({
        variant: "destructive",
        title: error?.data?.role?.[0] ?? t('Error during update invitation'),
        duration: 4000,
      });
    },
  });

  const { mutate: removeDocInvitation } = useDeleteDocInvitation({
    onError: (error) => {
      toast({
        variant: "destructive",
        title: error?.data?.role?.[0] ?? t('Error during delete invitation'),
        duration: 4000,
      });
    },
  });

  const onUpdate = (newRole: Role) => {
    updateDocInvitation({
      docId: doc.id,
      role: newRole,
      invitationId: invitation.id.toString(),
    });
  };

  const onRemove = () => {
    removeDocInvitation({ invitationId: invitation.id.toString(), docId: doc.id });
  };

  return (
    <div
      data-testid={`doc-share-invitation-row-${invitation.email}`}
      className="w-full"
    >
      <SearchUserRow
        isInvitation={true}
        alwaysShowRight={true}
        user={fakeUser}
        right={
          <div className="flex items-center gap-2">
            <DocRoleDropdown
              currentRole={invitation.role}
              onSelectRole={onUpdate}
              canUpdate={canUpdate}
            />

            {canUpdate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={onRemove}
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

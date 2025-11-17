import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from "@/components/ui/use-toast";

import { APIError } from '@/api';
import { User } from '@/types/api';
import { Doc, Role } from '@/features/docs';
import { Button } from "@/components/ui/button";

import { useCreateDocAccess, useCreateDocInvitation } from '../api';
import { OptionType } from '../types';

import { DocRoleDropdown } from './DocRoleDropdown';
import { DocShareAddMemberListItem } from './DocShareAddMemberListItem';

type APIErrorUser = APIError<{
  value: string;
  type: OptionType;
}>;

type Props = {
  doc: Doc;
  selectedUsers: User[];
  onRemoveUser?: (user: User) => void;
  onSubmit?: (selectedUsers: User[], role: Role) => void;
  afterInvite?: () => void;
};

export const DocShareAddMemberList = ({
  doc,
  selectedUsers,
  onRemoveUser,
  afterInvite,
}: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [invitationRole, setInvitationRole] = useState<Role>(Role.EDITOR);
  const canShare = doc.abilities.accesses_manage;

  const { mutateAsync: createInvitation } = useCreateDocInvitation();
  const { mutateAsync: createDocAccess } = useCreateDocAccess();

  const onError = (dataError: APIErrorUser) => {
    let messageError =
      dataError['data']?.type === OptionType.INVITATION
        ? t(`Failed to create the invitation for {{email}}.`, {
            email: dataError['data']?.value,
          })
        : t(`Failed to add the member in the document.`);

    if (
      dataError.cause?.[0] ===
      'Document invitation with this Email address and Document already exists.'
    ) {
      messageError = t('"{{email}}" is already invited to the document.', {
        email: dataError['data']?.value,
      });
    }

    if (
      dataError.cause?.[0] ===
      'This email is already associated to a registered user.'
    ) {
      messageError = t('"{{email}}" is already member of the document.', {
        email: dataError['data']?.value,
      });
    }

    toast({
      variant: "destructive",
      title: messageError,
      duration: 4000,
    });
  };

  const onInvite = async () => {
    setIsLoading(true);
    const promises = selectedUsers.map((user) => {
      const isInvitationMode = user.email === user.email;

      const payload = {
        role: invitationRole,
        docId: doc.id,
      };

      return isInvitationMode
        ? createInvitation({
            ...payload,
            email: user.email,
          })
        : createDocAccess({
            ...payload,
            memberId: user.id,
          });
    });

    const settledPromises = await Promise.allSettled(promises);
    settledPromises.forEach((settledPromise) => {
      if (settledPromise.status === 'rejected') {
        onError(settledPromise.reason as APIErrorUser);
      }
    });
    afterInvite?.();
    setIsLoading(false);
  };

  return (
    <div
      data-testid="doc-share-add-member-list"
      className="flex flex-row items-center p-3 bg-gray-50 rounded border border-gray-200 gap-2"
    >
      <div className="flex flex-row items-center flex-wrap flex-1 gap-2">
        {selectedUsers.map((user) => (
          <DocShareAddMemberListItem
            key={user.id}
            user={user}
            onRemoveUser={onRemoveUser}
          />
        ))}
      </div>
      <div className="flex flex-row items-center gap-2">
        <DocRoleDropdown
          canUpdate={canShare}
          currentRole={invitationRole}
          onSelectRole={setInvitationRole}
        />
        <Button onClick={() => void onInvite()} disabled={isLoading}>
          {t('Invite')}
        </Button>
      </div>
    </div>
  );
};

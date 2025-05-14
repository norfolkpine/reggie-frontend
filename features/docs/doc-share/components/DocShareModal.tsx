import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { User } from '@/types/api';
import { Access, Doc } from '@/features/docs';
import { useResponsiveStore } from '@/stores';
import { isValidEmail } from '@/lib/utils/string';

import {
  KEY_LIST_USER,
  useDocAccessesInfinite,
  useDocInvitationsInfinite,
  useUsers,
} from '../api';
import { Invitation } from '../types';

import { DocShareAddMemberList } from './DocShareAddMemberList';
import { DocShareInvitationItem } from './DocShareInvitationItem';
import { DocShareMemberItem } from './DocShareMemberItem';
import { DocShareModalFooter } from './DocShareModalFooter';
import { DocShareModalInviteUserRow } from './DocShareModalInviteUserByEmail';

type Props = {
  doc: Doc;
  onClose: () => void;
  open: boolean;
};

interface QuickSearchData<T> {
  groupName: string;
  elements: T[];
  endActions?: {
    content: React.ReactNode;
    onSelect: () => void;
  }[];
}

export const DocShareModal = ({ doc, onClose, open }: Props) => {
  const { t } = useTranslation();
  const selectedUsersRef = useRef<HTMLDivElement>(null);
  const { isDesktop } = useResponsiveStore();

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [inputValue, setInputValue] = useState('');

  const canShare = doc.abilities.accesses_manage;
  const canViewAccesses = doc.abilities.accesses_view;
  const showMemberSection = inputValue === '' && selectedUsers.length === 0;
  const showFooter = selectedUsers.length === 0 && !inputValue;
  const MIN_CHARACTERS_FOR_SEARCH = 4;

  const onSelect = (user: User) => {
    setSelectedUsers((prev) => [...prev, user]);
    setUserQuery('');
    setInputValue('');
  };

  const membersQuery = useDocAccessesInfinite({
    docId: doc.id,
  });

  const invitationQuery = useDocInvitationsInfinite({
    docId: doc.id,
  });

  const searchUsersQuery = useUsers(
    { query: userQuery, docId: doc.id },
    {
      enabled: userQuery?.length > MIN_CHARACTERS_FOR_SEARCH,
      queryKey: [KEY_LIST_USER, { query: userQuery }],
    },
  );

  const membersData: QuickSearchData<Access> = useMemo(() => {
    const members = membersQuery.data?.pages.flatMap((page) => page.results) || [];
    const count = membersQuery.data?.pages[0]?.count ?? 1;

    return {
      groupName:
        count === 1
          ? t('Document owner')
          : t('Share with {{count}} users', { count }),
      elements: members,
      endActions: membersQuery.hasNextPage
        ? [
            {
              content: (
                <button 
                  onClick={() => void membersQuery.fetchNextPage()}
                  className="text-sm text-muted-foreground hover:text-primary"
                  data-testid="load-more-members"
                >
                  {t('Load more')}
                </button>
              ),
              onSelect: () => void membersQuery.fetchNextPage(),
            },
          ]
        : undefined,
    };
  }, [membersQuery, t]);

  const invitationsData: QuickSearchData<Invitation> = useMemo(() => {
    const invitations = invitationQuery.data?.pages.flatMap((page) => page.results) || [];

    return {
      groupName: t('Pending invitations'),
      elements: invitations,
      endActions: invitationQuery.hasNextPage
        ? [
            {
              content: (
                <button 
                  onClick={() => void invitationQuery.fetchNextPage()}
                  className="text-sm text-muted-foreground hover:text-primary"
                  data-testid="load-more-invitations"
                >
                  {t('Load more')}
                </button>
              ),
              onSelect: () => void invitationQuery.fetchNextPage(),
            },
          ]
        : undefined,
    };
  }, [invitationQuery, t]);

  const searchUserData: QuickSearchData<User> = useMemo(() => {
    const users = searchUsersQuery.data || [];
    const isEmail = isValidEmail(userQuery);
    const newUser: User = {
      id: userQuery as unknown as number, // Type casting as your User interface expects a number
      first_name: '',
      last_name: '',
      email: userQuery,
      get_display_name: '',
      language: '',
      is_active: false,
      avatar_url: '',
      created_at: '',
      updated_at: ''
    };

    const hasEmailInUsers = users.some((user) => user.email === userQuery);

    return {
      groupName: t('Search user result'),
      elements: users,
      endActions:
        isEmail && !hasEmailInUsers
          ? [
              {
                content: <DocShareModalInviteUserRow user={newUser} />,
                onSelect: () => void onSelect(newUser),
              },
            ]
          : undefined,
    };
  }, [searchUsersQuery.data, t, userQuery]);

  const onFilter = useDebouncedCallback((str: string) => {
    setUserQuery(str);
  }, 300);

  const onRemoveUser = (row: User) => {
    setSelectedUsers((prevState) => prevState.filter((value) => value.id !== row.id));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[90vw] gap-0 p-0 overflow-hidden",
        isDesktop ? "h-[min(690px,calc(100vh-2rem))]" : "h-[calc(100vh-2rem)]"
      )}>
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">{t('Share the document')}</DialogTitle>
        </DialogHeader>

        <div className="flex  p-4 flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <div ref={selectedUsersRef}>
              {canShare && selectedUsers.length > 0 && (
                <div className="px-6 py-4">
                  <DocShareAddMemberList
                    doc={doc}
                    selectedUsers={selectedUsers}
                    onRemoveUser={onRemoveUser}
                    afterInvite={() => {
                      setUserQuery('');
                      setInputValue('');
                      setSelectedUsers([]);
                    }}
                  />
                </div>
              )}
              {!canViewAccesses && <Separator />}
            </div>

            <div data-testid="doc-share-quick-search" className="flex-1">
              {!canViewAccesses ? (
                <div className="h-full flex items-center justify-center">
                  <p className="max-w-[320px] text-center text-sm text-muted-foreground">
                    {t('You do not have permission to view users sharing this document or modify link settings.')}
                  </p>
                </div>
              ) : (
                <Command className="rounded-none border-none h-full">
                  {canShare && (
                    <div className="border-b sticky top-0 bg-white z-10">
                      <CommandInput 
                        value={inputValue}
                        onValueChange={(str) => {
                          setInputValue(str);
                          onFilter(str);
                        }}
                        placeholder={t('Type a name or email')}
                        className="border-0 py-4"
                      />
                    </div>
                  )}
                  
                  <CommandList>
                    <ScrollArea className="h-[calc(100vh-18rem)]">
                      {!showMemberSection && inputValue !== '' && (
                        <CommandGroup heading={searchUserData.groupName} className="p-2">
                          {searchUserData.elements.map((user) => (
                            <CommandItem 
                              key={user.id} 
                              onSelect={() => onSelect(user)}
                              className="rounded-md hover:bg-muted"
                            >
                              <DocShareModalInviteUserRow user={user} />
                            </CommandItem>
                          ))}
                          {searchUserData.endActions?.map((action, index) => (
                            <CommandItem key={index} onSelect={action.onSelect} className="rounded-md hover:bg-muted">
                              {action.content}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}

                      {showMemberSection && (
                        <>
                          {invitationsData.elements.length > 0 && (
                            <CommandGroup heading={invitationsData.groupName} className="p-2">
                              {invitationsData.elements.map((invitation) => (
                                <CommandItem key={invitation.id} className="rounded-md hover:bg-muted">
                                  <DocShareInvitationItem
                                    doc={doc}
                                    invitation={invitation}
                                  />
                                </CommandItem>
                              ))}
                              {invitationsData.endActions?.map((action, index) => (
                                <CommandItem key={index} onSelect={action.onSelect} className="rounded-md hover:bg-muted">
                                  {action.content}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}

                          <CommandGroup heading={membersData.groupName} className="p-2">
                            {membersData.elements.map((access) => (
                              <CommandItem key={access.id} className="rounded-md hover:bg-muted">
                                <DocShareMemberItem doc={doc} access={access} />
                              </CommandItem>
                            ))}
                            {membersData.endActions?.map((action, index) => (
                              <CommandItem key={index} onSelect={action.onSelect} className="rounded-md hover:bg-muted">
                                {action.content}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}

                      {searchUsersQuery.isLoading && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}

                      <CommandEmpty className="py-6 text-muted-foreground">
                        {t('No results found.')}
                      </CommandEmpty>
                    </ScrollArea>
                  </CommandList>
                </Command>
              )}
            </div>
          </div>

          {showFooter && (
            <div className="mt-auto border-t">
              <DocShareModalFooter doc={doc} onClose={onClose} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

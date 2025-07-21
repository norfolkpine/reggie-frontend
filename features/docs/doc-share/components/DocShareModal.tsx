import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import {
  Loader2,
  MoreHorizontal,
  ChevronDown,
  Link2,
  Globe,
  X,
  Users,
  Plus,
} from 'lucide-react';
import { useCreateDocInvitation } from '../api';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { User } from '@/types/api';
import {
  Access,
  Doc,
  Role,
  LinkReach,
  LinkRole,
  useCopyDocLink,
} from '@/features/docs';
import { Progress } from '@/components/ui/progress';
import { useUpdateDocLink } from '@/features/docs/doc-management/api/useUpdateDocLink';
import { useResponsiveStore } from '@/stores';
import { isValidEmail } from '@/lib/utils/string';
import {
  useCreateDocAccess,
  useDeleteDocAccess,
  useUpdateDocAccess,
} from '../api';

import {
  KEY_LIST_USER,
  useDocAccessesInfinite,
  useDocInvitationsInfinite,
  useUsers,
} from '../api';
import { Invitation } from '../types';

import { DocVisibility } from './DocVisibility';

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
  const createDocInvitation = useCreateDocInvitation();
  const [selectedRole, setSelectedRole] = useState<Role>(Role.READER);
  const { t } = useTranslation();
  const { isDesktop } = useResponsiveStore();
  const [inputValue, setInputValue] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const createDocAccess = useCreateDocAccess();
  const deleteDocAccess = useDeleteDocAccess();
  const updateDocAccess = useUpdateDocAccess();

  const canShare = doc.abilities.accesses_manage;
  const canViewAccesses = doc.abilities.accesses_view;
  const MIN_CHARACTERS_FOR_SEARCH = 4;

  // Fetch document members and invitations
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
    }
  );

  const onFilter = useDebouncedCallback((str: string) => {
    setUserQuery(str);
  }, 700);

  const onSelect = (user: User) => {
    setUserQuery(''); // Reset searchUsers by clearing the query
    setInputValue(user.email);
    setSelectedUser(user);
  };

  // Create derived data for the UI
  const members =
    membersQuery.data?.pages.flatMap((page) => page.results) || [];
  const invitations =
    invitationQuery.data?.pages.flatMap((page) => page.results) || [];
  const searchUsers = searchUsersQuery.data || [];
  const sharedTitle = t('Shared with {{count}} users', {
    count: members.length,
  });
  const copyDocLink = useCopyDocLink(doc.id);

  // State for link visibility and permissions
  const [linkVisibility, setLinkVisibility] = useState<LinkReach>(() => {
    if (doc.link_reach === LinkReach.PUBLIC) return LinkReach.PUBLIC;
    if (doc.link_reach === LinkReach.AUTHENTICATED)
      return LinkReach.AUTHENTICATED;
    return LinkReach.RESTRICTED;
  });
  const [linkPermission, setLinkPermission] = useState<LinkRole>(() => {
    if (doc.link_role === LinkRole.EDITOR) return LinkRole.EDITOR;
    return LinkRole.READER;
  });

  // Update doc link mutation
  const {
    mutate: updateDocLink,
    isPending: isUpdatingLink,
    error: updateLinkError,
  } = useUpdateDocLink();

  // Map UI values to backend values
  const visibilityOptions = [
    { value: LinkReach.RESTRICTED, label: t('Restricted') },
    { value: LinkReach.AUTHENTICATED, label: t('Authenticated') },
    { value: LinkReach.PUBLIC, label: t('Public') },
  ];
  const permissionOptions = [
    { value: LinkRole.EDITOR, label: t('Editor') },
    { value: LinkRole.READER, label: t('Reader') },
  ];

  // Handle updates
  const handleUpdateLink = (
    newVisibility: LinkReach = linkVisibility,
    newPermission: LinkRole = linkPermission
  ) => {
    updateDocLink({
      id: doc.id,
      link_reach: newVisibility,
      link_role: newPermission,
    });
  };

  const handleVisibilityChange = (value: LinkReach) => {
    setLinkVisibility(value);
    handleUpdateLink(value, linkPermission);
  };
  const handlePermissionChange = (value: LinkRole) => {
    setLinkPermission(value);
    handleUpdateLink(linkVisibility, value);
  };

  // Generate description text based on selected permissions
  const getLinkDescription = () => {
    if (linkVisibility === LinkReach.RESTRICTED) {
      return linkPermission === LinkRole.EDITOR
        ? t('People with the link can edit')
        : t('People with the link can view');
    } else if (linkVisibility === LinkReach.AUTHENTICATED) {
      return linkPermission === LinkRole.EDITOR
        ? t('Authenticated users can edit this doc')
        : t('Authenticated users can view this doc');
    } else if (linkVisibility === LinkReach.PUBLIC) {
      return linkPermission === LinkRole.EDITOR
        ? t('Everyone can edit this doc')
        : t('Everyone can view this doc');
    } else {
      return t('Only specific people can access');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden flex flex-col max-h-[80vh]">
        <DialogTitle className="sr-only">{t('Share Document')}</DialogTitle>

        {/* Header - Fixed */}
        <div className="p-6 pb-4 border-b">
          <div className="relative"></div>

          <h2 className="text-xl font-semibold pr-6">{sharedTitle}</h2>
        </div>

        {/* Body - Scrollable */}
        <ScrollArea className="flex-1  pt-4">
          {/* Add User by Email Form */}
          <div className="px-8 pt-4 pb-2">
            <div className="flex flex-row items-end gap-3">
              <div className="flex flex-col w-full relative">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="invite-email-input"
                >
                  Add User by Email
                </label>
                <div className="flex flex-row gap-2 items-center w-full">
                  <input
                    id="invite-email-input"
                    type="email"
                    placeholder="Enter email address"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 h-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      onFilter(e.target.value); // Use debounced function for user search
                      setSelectedUser(null);
                    }}
                    autoComplete="off"
                    aria-label="Invite user by email"
                  />
                  <select
                    id="invite-role-select"
                    className="border border-gray-300 rounded-md px-2 py-2 text-sm bg-background min-w-[100px] h-10"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as Role)}
                    data-testid="invite-role-select"
                    aria-label="Select role"
                  >
                    <option value={Role.READER}>Reader</option>
                    <option value={Role.EDITOR}>Editor</option>
                    <option value={Role.OWNER}>Admin</option>
                  </select>
                  <Button
                    type="button"
                    className="flex items-center gap-1 min-w-[72px] h-10 px-4"
                    onClick={() => {
                      if (selectedUser) {
                        createDocAccess.mutate(
                          {
                            memberId: selectedUser.id,
                            role: selectedRole,
                            docId: doc.id,
                          },
                          {
                            onSuccess: () => {
                              setInputValue('');
                              setSelectedUser(null);
                            },
                          }
                        );
                      } else {
                        createDocInvitation.mutate(
                          {
                            email: inputValue,
                            role: selectedRole,
                            docId: doc.id,
                          },
                          {
                            onSuccess: () => {
                              setInputValue('');
                            },
                          }
                        );
                      }

                      setUserQuery('');
                    }}
                    data-testid="invite-add-btn"
                  >
                    {createDocInvitation.isPending ||
                    createDocAccess.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    Add
                  </Button>
                </div>
                {/* Autocomplete dropdown for existing users */}
                {userQuery &&
                  selectedUser === null &&
                  searchUsers.length > 0 && (
                    <ul
                      className="absolute z-30 left-0 right-0 top-[250px] bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto mt-1"
                      style={{
                        top: '60px',
                        zIndex: 1000000,
                      }}
                    >
                      {searchUsers.map((user: User, idx: number) => (
                        <li key={user.id}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                            onClick={() => onSelect(user)}
                            tabIndex={0}
                          >
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="font-medium mr-2">
                              {user.get_display_name || user.email}
                            </span>
                            <span className="text-xs text-gray-500">
                              {user.email}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
              {createDocInvitation.isError && (
                <div className="text-xs text-red-500 mt-1 ml-2">
                  {createDocInvitation.error?.message ||
                    'Failed to send invite.'}
                </div>
              )}
              {createDocAccess.isError && (
                <div className="text-xs text-red-500 mt-1 ml-2">
                  {createDocAccess.error?.message || 'Failed to send invite.'}
                </div>
              )}
            </div>
          </div>
          {/* Members list */}
          <div className="space-y-4 px-8 py-4 mb-8">
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="bg-muted rounded-full p-3 mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  {t('No one has access yet')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('Add people to collaborate on this document')}
                </p>
              </div>
            ) : (
              members.map((access, idx) => (
                <div
                  key={access.id}
                  className={`flex items-center justify-between${
                    idx !== members.length - 1 ? ' mb-4' : ''
                  }`}
                  data-testid={`doc-share-member-row-${access.user.email}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                      {access.user.avatar_url ? (
                        <img
                          src={access.user.avatar_url}
                          alt={
                            access.user.get_display_name || access.user.email
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          {(access.user.get_display_name || access.user.email)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {access.user.get_display_name || access.user.email}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {access.user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-8">
                          {access.role === Role.OWNER
                            ? 'Admin'
                            : access.role === Role.EDITOR
                            ? 'Editor'
                            : 'Reader'}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={updateDocAccess.isPending}
                          onClick={() => {
                            if (access.role !== Role.OWNER) {
                              updateDocAccess.mutate({
                                docId: doc.id,
                                accessId: access.id,
                                role: Role.OWNER,
                              });
                            }
                          }}
                        >
                          {updateDocAccess.isPending &&
                          updateDocAccess.variables?.accessId === access.id &&
                          updateDocAccess.variables?.role === Role.OWNER ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1 inline" />
                          ) : null}
                          Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={updateDocAccess.isPending}
                          onClick={() => {
                            if (access.role !== Role.EDITOR) {
                              updateDocAccess.mutate({
                                docId: doc.id,
                                accessId: access.id,
                                role: Role.EDITOR,
                              });
                            }
                          }}
                        >
                          {updateDocAccess.isPending &&
                          updateDocAccess.variables?.accessId === access.id &&
                          updateDocAccess.variables?.role === Role.EDITOR ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1 inline" />
                          ) : null}
                          Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={updateDocAccess.isPending}
                          onClick={() => {
                            if (access.role !== Role.READER) {
                              updateDocAccess.mutate({
                                docId: doc.id,
                                accessId: access.id,
                                role: Role.READER,
                              });
                            }
                          }}
                        >
                          {updateDocAccess.isPending &&
                          updateDocAccess.variables?.accessId === access.id &&
                          updateDocAccess.variables?.role === Role.READER ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1 inline" />
                          ) : null}
                          Reader
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={deleteDocAccess.isPending}
                          onClick={() => {
                            deleteDocAccess.mutate({
                              docId: doc.id,
                              accessId: access.id,
                            });
                          }}
                        >
                          {deleteDocAccess.isPending &&
                          deleteDocAccess.variables?.accessId === access.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1 inline" />
                          ) : null}
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>

          <Separator className="" />
        </ScrollArea>
        {/* Link parameters section */}
        <div className="flex flex-col p-6 py-2">
          <h3 className="font-semibold text-base mb-4">
            {t('Link parameters')}
          </h3>

          <div className="mb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white">
                  <Globe className="h-4 w-4" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8">
                      {visibilityOptions.find((option) => option.value === linkVisibility)?.label}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {visibilityOptions.map(({ value, label }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => handleVisibilityChange(value)}
                      disabled={isUpdatingLink}
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {linkVisibility !== LinkReach.RESTRICTED && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8">
                      {permissionOptions.find((option) => option.value === linkPermission)?.label}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {permissionOptions.map(({ value, label }) => (
                        <DropdownMenuItem
                          key={value}
                          onClick={() => handlePermissionChange(value)}
                          disabled={isUpdatingLink}
                        >
                          {label}
                    </DropdownMenuItem>
                  ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isUpdatingLink && (
              <p className="text-xs text-muted-foreground ml-11">
                {t('Saving...')}
              </p>
            )}
            {updateLinkError && (
              <p className="text-xs text-red-500 ml-11">
                {t('Failed to update link settings')}
              </p>
            )}
            <p className="text-sm text-muted-foreground ml-11">
              {getLinkDescription()}
            </p>
          </div>
        </div>
        {/* Progress bar for link update */}
        {isUpdatingLink && (
          <div className="px-6 mb-2">
            <Progress className="h-1" value={undefined} />
          </div>
        )}
        <div className="p-6 border-t">
          <div className="flex justify-start">
            <Button
              variant="outline"
              onClick={copyDocLink}
              className="flex items-center gap-2 px-4"
            >
              <Link2 className="h-4 w-4" />
              {t('Copy link')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

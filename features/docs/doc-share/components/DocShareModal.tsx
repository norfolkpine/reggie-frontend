import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import { Loader2, MoreHorizontal, ChevronDown, Link2, Globe, X, Users } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { User } from '@/types/api';
import { Access, Doc, Role, useCopyDocLink } from '@/features/docs';
import { useResponsiveStore } from '@/stores';
import { isValidEmail } from '@/lib/utils/string';

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
  const { t } = useTranslation();
  const { isDesktop } = useResponsiveStore();
  const [inputValue, setInputValue] = useState('');
  const [userQuery, setUserQuery] = useState('');

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
    },
  );

  const onFilter = useDebouncedCallback((str: string) => {
    setUserQuery(str);
  }, 300);

  const onSelect = (user: User) => {
    // In a real implementation, we would add the user to the document here
    // For now, just clear the input
    setUserQuery('');
    setInputValue('');
  };

  // Create derived data for the UI
  const members = membersQuery.data?.pages.flatMap((page) => page.results) || [];
  const invitations = invitationQuery.data?.pages.flatMap((page) => page.results) || [];
  const searchUsers = searchUsersQuery.data || [];
  const sharedTitle = t('Shared with {{count}} users', { count: members.length });
  const copyDocLink = useCopyDocLink(doc.id);
  
  // State for link visibility and permissions
  const [linkVisibility, setLinkVisibility] = useState('Public');
  const [linkPermission, setLinkPermission] = useState('Edit');
  
  // Generate description text based on selected permissions
  const getLinkDescription = () => {
    if (linkVisibility === 'Private') {
      return t('Only specific people can access');
    } else if (linkVisibility === 'Restricted') {
      return linkPermission === 'Edit' 
        ? t('People with the link can edit') 
        : t('People with the link can view');
    } else { // Public
      return linkPermission === 'Edit' 
        ? t('Everyone can edit this doc') 
        : t('Everyone can view this doc');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden flex flex-col max-h-[80vh]">
        <DialogTitle className="sr-only">{t('Share Document')}</DialogTitle>
        
        {/* Header - Fixed */}
        <div className="p-6 pb-4 border-b">
          <div className="relative">
            
          </div>
          
          <h2 className="text-xl font-semibold pr-6">{sharedTitle}</h2>
        </div>
        
        {/* Body - Scrollable */}
        <ScrollArea className="flex-1  pt-4">
          {/* Members list */}
          <div className="space-y-4 px-6 mb-8">
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="bg-muted rounded-full p-3 mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">{t('No one has access yet')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('Add people to collaborate on this document')}</p>
            </div>
          ) : (
            members.map((access) => (
            <div 
              key={access.id} 
              className="flex items-center justify-between"
              data-testid={`doc-share-member-row-${access.user.email}`}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                  {access.user.avatar_url ? (
                    <img 
                      src={access.user.avatar_url} 
                      alt={access.user.get_display_name || access.user.email}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                      {(access.user.get_display_name || access.user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{access.user.get_display_name || access.user.email}</span>
                  <span className="text-sm text-muted-foreground">{access.user.email}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8">
                      {access.role === Role.OWNER ? 'Admin' : 
                       access.role === Role.EDITOR ? 'Editor' : 'Reader'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Admin</DropdownMenuItem>
                    <DropdownMenuItem>Editor</DropdownMenuItem>
                    <DropdownMenuItem>Reader</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Remove</DropdownMenuItem>
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
            <h3 className="font-semibold text-base mb-4">{t('Link parameters')}</h3>
            
            <div className="mb-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white">
                    <Globe className="h-4 w-4" />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-8">
                        {linkVisibility}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {['Public', 'Restricted', 'Private'].map((visibility) => (
                        <DropdownMenuItem 
                          key={visibility}
                          onClick={() => setLinkVisibility(visibility)}
                        >
                          {visibility}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {linkVisibility !== 'Private' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-8">
                        {linkPermission}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {['Edit', 'View'].map((permission) => (
                        <DropdownMenuItem 
                          key={permission}
                          onClick={() => setLinkPermission(permission)}
                        >
                          {permission}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground ml-11">{getLinkDescription()}</p>
            </div>
          </div>
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

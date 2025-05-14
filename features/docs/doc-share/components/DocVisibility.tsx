import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import {
  Doc,
  KEY_DOC,
  KEY_LIST_DOC,
  LinkReach,
  LinkRole,
  useUpdateDocLink,
} from '@/features/docs';
import { useResponsiveStore } from '@/stores';

import { useTranslatedShareSettings } from '../hooks/';

interface DocVisibilityProps {
  doc: Doc;
  className?: string;
}

type LinkReachChoice = {
  icon: string;
  label: string;
  descriptionReadOnly: string;
  descriptionEdit: string;
};

type LinkReachChoices = {
  [K in LinkReach]: LinkReachChoice;
};

type LinkReachTranslations = {
  [K in LinkReach]: string;
};

type LinkModeTranslations = {
  [K in LinkRole]: string;
};

export const DocVisibility = ({ doc, className }: DocVisibilityProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isDesktop } = useResponsiveStore();
  const canManage = doc.abilities.accesses_manage;
  const [linkReach, setLinkReach] = useState<LinkReach>(doc.link_reach);
  const [docLinkRole, setDocLinkRole] = useState<LinkRole>(doc.link_role);
  
  const { 
    linkModeTranslations,
    linkReachChoices,
    linkReachTranslations 
  } = useTranslatedShareSettings() as {
    linkModeTranslations: LinkModeTranslations;
    linkReachChoices: LinkReachChoices;
    linkReachTranslations: LinkReachTranslations;
  };

  const api = useUpdateDocLink({
    onSuccess: () => {
      toast({
        title: t('Success'),
        description: t('The document visibility has been updated.'),
        variant: 'default',
      });
    },
    listInvalideQueries: [KEY_LIST_DOC, KEY_DOC],
  });

  const updateReach = (link_reach: LinkReach) => {
    api.mutate({ id: doc.id, link_reach });
    setLinkReach(link_reach);
  };

  const updateLinkRole = (link_role: LinkRole) => {
    api.mutate({ id: doc.id, link_role });
    setDocLinkRole(link_role);
  };

  const showLinkRoleOptions = doc.link_reach !== LinkReach.RESTRICTED;
  const description =
    docLinkRole === LinkRole.READER
      ? linkReachChoices[linkReach]?.descriptionReadOnly
      : linkReachChoices[linkReach]?.descriptionEdit;

  return (
    <div className={cn("px-6 space-y-4", className)} aria-label={t('Doc visibility card')}>
      <h3 className="font-bold text-sm text-foreground/90">
        {t('Link parameters')}
      </h3>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={!canManage}>
              <Button 
                variant="outline"
                className={cn(
                  "flex items-center gap-2",
                  !canManage && "opacity-70 cursor-not-allowed"
                )}
              >
                {linkReachChoices[linkReach]?.icon && (
                  <span className="material-icons text-primary">
                    {linkReachChoices[linkReach].icon}
                  </span>
                )}
                <span className={cn(
                  "font-medium",
                  canManage ? "text-primary" : "text-muted-foreground"
                )}>
                  {linkReachChoices[linkReach]?.label}
                </span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(Object.keys(linkReachTranslations) as LinkReach[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => updateReach(key)}
                  className="flex items-center gap-2"
                >
                  {linkReachChoices[key]?.icon && (
                    <span className="material-icons text-primary">
                      {linkReachChoices[key].icon}
                    </span>
                  )}
                  <span>{linkReachTranslations[key]}</span>
                  {linkReach === key && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isDesktop && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {showLinkRoleOptions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={!canManage}>
              <Button 
                variant="outline"
                className={cn(
                  !canManage && "opacity-70 cursor-not-allowed"
                )}
              >
                {linkModeTranslations[docLinkRole]}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(linkModeTranslations) as LinkRole[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => updateLinkRole(key)}
                >
                  {linkModeTranslations[key]}
                  {docLinkRole === key && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {!isDesktop && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

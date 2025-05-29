"use client";

import { Languages } from "lucide-react";
import { Settings } from 'luxon';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useConfig } from '@/config';
import { useLanguageSynchronizer } from './hooks/useLanguageSynchronizer';
import { getMatchingLocales } from './utils/locale';

export const LanguagePicker = () => {
  const { t, i18n } = useTranslation();
  const { data: conf } = useConfig();
  const { synchronizeLanguage } = useLanguageSynchronizer();
  const language = i18n.languages[0];
  Settings.defaultLocale = language;

  // Compute options for dropdown
  const optionsPicker = useMemo(() => {
    const backendOptions = conf?.LANGUAGES ?? [[language, language]];
    return backendOptions.map(([backendLocale, label]) => {
      // Determine if the option is selected
      const isSelected =
        getMatchingLocales([backendLocale], [language]).length > 0;
      // Define callback for updating both frontend and backend languages
      const callback = () => {
        i18n
          .changeLanguage(backendLocale)
          .then(() => {
            void synchronizeLanguage('toBackend');
          })
          .catch((err) => {
            console.error('Error changing language', err);
          });
      };
      return { label, isSelected, callback };
    });
  }, [conf, i18n, language, synchronizeLanguage]);

  // Extract current language label for display
  const currentLanguageLabel =
    conf?.LANGUAGES.find(
      ([code]) => getMatchingLocales([code], [language]).length > 0,
    )?.[1] || language;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 hover:bg-accent"
          aria-label={t('Language')}
        >
          <Languages className="h-4 w-4" />
          <span>{currentLanguageLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {optionsPicker.map(({ label, isSelected, callback }) => (
          <DropdownMenuItem
            key={label}
            className={`${isSelected ? 'bg-accent' : ''}`}
            onClick={callback}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

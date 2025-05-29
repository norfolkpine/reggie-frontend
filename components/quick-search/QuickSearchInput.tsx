import { Loader } from '@openfun/cunningham-react';
import { Command } from 'cmdk';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useCunninghamTheme } from '@/cunningham';
import { IconSearch } from '@tabler/icons-react';
import { HorizontalSeparator } from '../separators';


type Props = {
  loading?: boolean;
  inputValue?: string;
  onFilter?: (str: string) => void;
  placeholder?: string;
  children?: ReactNode;
  withSeparator?: boolean;
};
export const QuickSearchInput = ({
  loading,
  inputValue,
  onFilter,
  placeholder,
  children,
  withSeparator: separator = true,
}: Props) => {
  const { t } = useTranslation();
  const { spacingsTokens } = useCunninghamTheme();

  if (children) {
    return (
      <>
        {children}
        {separator && <HorizontalSeparator />}
      </>
    );
  }

  return (
    <>
      <div
        className="flex items-center gap-2 flex-row quick-search-input"
      >
        {!loading && <IconSearch/>}
        {loading && (
          <div>
            <Loader size="small" />
          </div>
        )}
        <Command.Input
          /* eslint-disable-next-line jsx-a11y/no-autofocus */
          autoFocus={true}
          aria-label={t('Quick search input')}
          value={inputValue}
          role="combobox"
          placeholder={placeholder ?? t('Search')}
          onValueChange={onFilter}
        />
      </div>
      {separator && <HorizontalSeparator $withPadding={false} />}
    </>
  );
};

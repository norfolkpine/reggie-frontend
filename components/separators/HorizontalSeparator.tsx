import { useCunninghamTheme } from '@/cunningham';


export enum SeparatorVariant {
  LIGHT = 'light',
  DARK = 'dark',
}

type Props = {
  variant?: SeparatorVariant;
  $withPadding?: boolean;
};

export const HorizontalSeparator = ({
  variant = SeparatorVariant.LIGHT,
  $withPadding = true,
}: Props) => {
  const { colorsTokens } = useCunninghamTheme();

  return (
    <div
      className="h-px w-full --docs--horizontal-separator"
      style={{
        marginTop: $withPadding ? 'base' : 'none',
        backgroundColor:
        variant === SeparatorVariant.DARK
          ? '#e5e5e533'
          : colorsTokens['greyscale-100']
      }}
    />
  );
};

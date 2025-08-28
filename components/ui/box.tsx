import { ComponentPropsWithRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BoxProps extends ComponentPropsWithRef<'div'> {
  as?: keyof JSX.IntrinsicElements;
  $align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  $background?: string;
  $color?: string;
  $cursor?: 'pointer' | 'default' | 'not-allowed' | 'wait';
  $direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  $display?: 'block' | 'inline-block' | 'inline' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none';
  $flex?: string;
  $gap?: string;
  $height?: string;
  $justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  $margin?: string;
  $maxHeight?: string;
  $minHeight?: string;
  $maxWidth?: string;
  $minWidth?: string;
  $padding?: string;
  $position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  $radius?: string;
  $width?: string;
  $wrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  $zIndex?: string;
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ 
    as: Component = 'div',
    $align,
    $background,
    $color,
    $cursor,
    $direction = 'col',
    $display = 'flex',
    $flex,
    $gap,
    $height,
    $justify,
    $margin,
    $maxHeight,
    $minHeight,
    $maxWidth,
    $minWidth,
    $padding,
    $position,
    $radius,
    $width,
    $wrap,
    $zIndex,
    className,
    style,
    ...props
  }, ref) => {
    const boxClasses = cn(
      // Display
      {
        'block': $display === 'block',
        'inline-block': $display === 'inline-block',
        'inline': $display === 'inline',
        'flex': $display === 'flex',
        'inline-flex': $display === 'inline-flex',
        'grid': $display === 'grid',
        'inline-grid': $display === 'inline-grid',
        'hidden': $display === 'none',
      },
      // Flex direction
      {
        'flex-row': $direction === 'row',
        'flex-row-reverse': $direction === 'row-reverse',
        'flex-col': $direction === 'col',
        'flex-col-reverse': $direction === 'col-reverse',
      },
      // Alignment
      {
        'items-start': $align === 'start',
        'items-end': $align === 'end',
        'items-center': $align === 'center',
        'items-baseline': $align === 'baseline',
        'items-stretch': $align === 'stretch',
      },
      // Justify
      {
        'justify-start': $justify === 'start',
        'justify-end': $justify === 'end',
        'justify-center': $justify === 'center',
        'justify-between': $justify === 'between',
        'justify-around': $justify === 'around',
        'justify-evenly': $justify === 'evenly',
      },
      // Wrap
      {
        'flex-wrap': $wrap === 'wrap',
        'flex-wrap-reverse': $wrap === 'wrap-reverse',
        'flex-nowrap': $wrap === 'nowrap',
      },
      // Cursor
      {
        'cursor-pointer': $cursor === 'pointer',
        'cursor-default': $cursor === 'default',
        'cursor-not-allowed': $cursor === 'not-allowed',
        'cursor-wait': $cursor === 'wait',
      },
      className
    );

    const boxStyles: React.CSSProperties = {
      ...style,
      ...($background && { background: $background }),
      ...($color && { color: $color }),
      ...($flex && { flex: $flex }),
      ...($gap && { gap: $gap }),
      ...($height && { height: $height }),
      ...($margin && { margin: $margin }),
      ...($maxHeight && { maxHeight: $maxHeight }),
      ...($minHeight && { minHeight: $minHeight }),
      ...($maxWidth && { maxWidth: $maxWidth }),
      ...($minWidth && { minWidth: $minWidth }),
      ...($padding && { padding: $padding }),
      ...($position && { position: $position }),
      ...($radius && { borderRadius: $radius }),
      ...($width && { width: $width }),
      ...($zIndex && { zIndex: $zIndex }),
    };

    return (
      <Component
        ref={ref}
        className={boxClasses}
        style={boxStyles}
        {...props}
      />
    );
  }
);

Box.displayName = 'Box';

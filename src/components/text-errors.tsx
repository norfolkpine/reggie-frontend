"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ComponentPropsWithRef, forwardRef, ReactNode } from "react";

type TextElement = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type TextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl";
type TextTheme = "primary" | "primary-text" | "secondary" | "secondary-text" | "info" | "success" | "warning" | "danger" | "greyscale";
type TextVariation = "text" | "000" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "1000";

interface TextProps extends Omit<ComponentPropsWithRef<"span">, "color"> {
  as?: TextElement;
  elipsis?: boolean;
  weight?: "normal" | "medium" | "semibold" | "bold";
  textAlign?: "left" | "center" | "right" | "justify";
  size?: TextSize;
  theme?: TextTheme;
  variation?: TextVariation;
  className?: string;
}

const Text = forwardRef<HTMLElement, TextProps>(
  ({ 
    as: Component = "span",
    elipsis,
    weight,
    textAlign,
    size = "base",
    theme = "greyscale",
    variation = "text",
    className,
    ...props
  }, ref) => {
    const textStyles = cn(
      // Base styles
      "text-gray-900",
      
      // Size variants
      {
        "text-xs": size === "xs",
        "text-sm": size === "sm",
        "text-base": size === "base",
        "text-lg": size === "lg",
        "text-xl": size === "xl",
        "text-2xl": size === "2xl",
        "text-3xl": size === "3xl",
        "text-4xl": size === "4xl",
        "text-5xl": size === "5xl",
        "text-6xl": size === "6xl",
        "text-7xl": size === "7xl",
        "text-8xl": size === "8xl",
        "text-9xl": size === "9xl",
      },
      
      // Weight variants
      {
        "font-normal": weight === "normal",
        "font-medium": weight === "medium",
        "font-semibold": weight === "semibold",
        "font-bold": weight === "bold",
      },
      
      // Text alignment
      {
        "text-left": textAlign === "left",
        "text-center": textAlign === "center",
        "text-right": textAlign === "right",
        "text-justify": textAlign === "justify",
      },
      
      // Theme and variation colors
      {
        "text-primary": theme === "primary",
        "text-secondary": theme === "secondary",
        "text-info": theme === "info",
        "text-success": theme === "success",
        "text-warning": theme === "warning",
        "text-destructive": theme === "danger",
        "text-gray-500": theme === "greyscale" && variation === "text",
      },
      
      // Elipsis
      {
        "whitespace-nowrap overflow-hidden text-ellipsis": elipsis,
      },
      
      className
    );

    return (
      <Component
        ref={ref as any}
        className={textStyles}
        {...props}
      />
    );
  }
);

Text.displayName = "Text";

interface TextErrorsProps {
  causes?: string[];
  defaultMessage?: string;
  className?: string;
  icon?: ReactNode;
}

export function TextErrors({
  causes,
  defaultMessage,
  className,
  icon,
}: TextErrorsProps) {
  const { t } = useTranslation();

  return (
    <Alert variant="destructive" className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        {icon || <ExclamationTriangleIcon className="h-4 w-4" />}
        <div className="flex flex-col gap-0.5">
          {causes?.map((cause, i) => (
            <Text
              key={`causes-${i}`}
              theme="danger"
              variation="600"
              textAlign="center"
              className="text-destructive-foreground"
            >
              {cause}
            </Text>
          ))}
          {!causes && (
            <Text
              theme="danger"
              variation="600"
              textAlign="center"
              className="text-destructive-foreground"
            >
              {defaultMessage || t("Something bad happens, please retry.")}
            </Text>
          )}
        </div>
      </div>
    </Alert>
  );
}

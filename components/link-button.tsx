import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import Link, { LinkProps } from "next/link";
import { Button, ButtonProps } from "./ui/button";

type LinkButtonProps = ButtonProps & Omit<LinkProps, keyof ButtonProps> & {
  loading?: boolean;
};

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, children, loading, ...props }, ref) => {
    return (
      <Button asChild disabled={loading} {...props}>
        <Link href={href} ref={ref}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {children}
            </>
          ) : (
            children
          )}
        </Link>
      </Button>
    );
  }
);

LinkButton.displayName = "LinkButton";

export { LinkButton };
export type { LinkButtonProps };

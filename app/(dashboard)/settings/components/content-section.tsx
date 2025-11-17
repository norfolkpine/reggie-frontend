import { Separator } from "@/components/ui/separator";
import { JSX } from "react";

interface ContentSectionProps {
  title: string;
  desc: string;
  children: JSX.Element;
  actions?: JSX.Element;
}

export default function ContentSection({
  title,
  desc,
  children,
  actions,
}: ContentSectionProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-none flex flex-row justify-between">
        <div className="flex flex-col justify-start gap-2">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <Separator className="my-4 flex-none" />
      <div className="faded-bottom -mx-4 flex-1 overflow-auto scroll-smooth px-4 md:pb-16">
        <div>{children}</div>
      </div>
    </div>
  );
}

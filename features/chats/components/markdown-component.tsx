import { CopyButton } from '@/components/ui/copy-button';
import type { Components } from 'react-markdown';

interface MarkdownProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MarkdownComponents: Components = {
  h1: ({ children, ...props }: MarkdownProps) => (
    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: MarkdownProps) => (
    <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-4" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: MarkdownProps) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: MarkdownProps) => (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }: MarkdownProps) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6 mb-4" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: MarkdownProps) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: MarkdownProps) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: MarkdownProps) => (
    <li className="mb-2" {...props}>
      {children}
    </li>
  ),
  pre: ({ children, ...props }: MarkdownProps) => (
    <pre className="relative mb-4 mt-6 overflow-x-auto rounded-lg border bg-black p-4">
      <div className="absolute right-4 top-4">
        <CopyButton value={children as string} />
      </div>
      {children}
    </pre>
  ),
  code: ({ node, inline, className, children, ...props }: MarkdownProps & { inline?: boolean }) => {
    if (inline) {
      return (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="relative font-mono text-sm" {...props}>
        {children}
      </code>
    );
  },
  blockquote: ({ children, ...props }: MarkdownProps) => (
    <blockquote
      className="mt-6 border-l-2 border-border pl-6 italic [&>*]:text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, ...props }: MarkdownProps) => (
    <a
      className="font-medium underline underline-offset-4 hover:text-primary"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  table: ({ children, ...props }: MarkdownProps) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: MarkdownProps) => (
    <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: MarkdownProps) => (
    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props}>
      {children}
    </td>
  ),
  hr: ({ ...props }: MarkdownProps) => (
    <hr className="my-4 border-border" {...props} />
  ),
  img: ({ alt, ...props }: MarkdownProps & { alt?: string }) => (
    <img className="rounded-md border" alt={alt} {...props} />
  ),
  strong: ({ children, ...props }: MarkdownProps) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: MarkdownProps) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
};
  
  
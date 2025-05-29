import { Loader2 } from 'lucide-react';

type DocsGridLoaderProps = {
  isLoading: boolean;
};

export const DocsGridLoader = ({ isLoading }: DocsGridLoaderProps) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div
      data-testid="grid-loader"
      className="fixed inset-0 z-[998] flex h-full w-full items-center justify-center bg-white/50 --docs--doc-grid-loader"
      style={{ overflow: 'hidden' }}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

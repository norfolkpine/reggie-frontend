import { MarkdownDemo } from '@/features/chats/components/markdown-demo';

export default function MarkdownDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Enhanced Markdown Components Demo</h1>
        <MarkdownDemo />
      </div>
    </div>
  );
} 
// Define markdown components for better styling
export const MarkdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-bold mt-6 mb-4" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-bold mt-6 mb-4" {...props} />
    ),
    p: ({ node, ...props }: any) => <p className="mb-4" {...props} />,
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc pl-5 mb-4" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal pl-5 mb-4" {...props} />
    ),
    li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
    pre: ({ node, ...props }: any) => (
      <pre
        className="rounded-md p-4 mb-4 overflow-x-auto bg-gray-800"
        {...props}
      />
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      if (inline) {
        return (
          <code className="font-mono text-sm rounded px-1 bg-gray-100" {...props}>
            {children}
          </code>
        );
      }
      return (
        <code
          className="block font-mono text-sm p-0 bg-transparent text-gray-200"
          {...props}
        >
          {children}
        </code>
      );
    },
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="pl-4 border-l-4 border-gray-300 italic my-4"
        {...props}
      />
    ),
    a: ({ node, ...props }: any) => (
      <a className="text-blue-600 hover:underline" {...props} />
    ),
    table: ({ node, ...props }: any) => (
      <table className="w-full border-collapse mb-4" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="border border-gray-300 px-3 py-2 bg-gray-100" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="border border-gray-300 px-3 py-2" {...props} />
    ),
  };
  
  
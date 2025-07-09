"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, Copy, Code2 } from 'lucide-react';

interface SyntaxHighlighterProps {
  children: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
}

// Fallback component for when syntax highlighting is not available
const FallbackCodeBlock = ({ children, language, className, showCopyButton = true }: SyntaxHighlighterProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="group relative my-2 rounded-lg border bg-muted/50 overflow-hidden">
      {/* Language header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {language || 'text'}
          </span>
        </div>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Code content */}
      <pre className="p-4 overflow-x-auto bg-background/50">
        <code className={cn("font-mono text-sm leading-relaxed", className)}>
          {children}
        </code>
      </pre>
    </div>
  );
};

// Syntax highlighter component with dynamic import
const SyntaxHighlighterWithShiki: React.FC<SyntaxHighlighterProps> = ({ 
  children, 
  language = 'text', 
  className, 
  showLineNumbers = false,
  showCopyButton = true 
}) => {
  const [highlightedCode, setHighlightedCode] = useState<React.ReactNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSyntaxHighlighting = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Dynamic import of shiki
        const { codeToTokens, bundledLanguages } = await import("shiki");
        
        // Check if language is supported
        if (!(language in bundledLanguages)) {
          if (mounted) {
            setError(true);
            setIsLoading(false);
          }
          return;
        }

        const { tokens } = await codeToTokens(children, {
          lang: language as keyof typeof bundledLanguages,
          defaultColor: false,
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
        });

        if (mounted) {
          const highlighted = (
            <>
              {tokens.map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {showLineNumbers && (
                    <span className="inline-block w-8 text-muted-foreground select-none">
                      {lineIndex + 1}
                    </span>
                  )}
                  <span>
                    {line.map((token, tokenIndex) => {
                      const style = typeof token.htmlStyle === "string" ? undefined : token.htmlStyle;
                      return (
                        <span
                          key={tokenIndex}
                          className="text-shiki-light bg-shiki-light-bg dark:text-shiki-dark dark:bg-shiki-dark-bg"
                          style={style}
                        >
                          {token.content}
                        </span>
                      );
                    })}
                  </span>
                  {lineIndex !== tokens.length - 1 && "\n"}
                </React.Fragment>
              ))}
            </>
          );
          setHighlightedCode(highlighted);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Syntax highlighting failed, falling back to plain text:', err);
        if (mounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    loadSyntaxHighlighting();

    return () => {
      mounted = false;
    };
  }, [children, language, showLineNumbers]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Show fallback if there's an error or language is not supported
  if (error || isLoading) {
    return <FallbackCodeBlock {...{ children, language, className, showCopyButton }} />;
  }

  return (
    <div className="group relative my-2 rounded-lg border bg-muted/50 overflow-hidden">
      {/* Language header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {language}
          </span>
        </div>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Code content with syntax highlighting */}
      <pre className="p-4 overflow-x-auto bg-background/50">
        <code className={cn("font-mono text-sm leading-relaxed", className)}>
          {highlightedCode || children}
        </code>
      </pre>
    </div>
  );
};

// Main syntax highlighter component
export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = (props) => {
  return (
    <Suspense fallback={<FallbackCodeBlock {...props} />}>
      <SyntaxHighlighterWithShiki {...props} />
    </Suspense>
  );
};

// Export the fallback component for direct use
export { FallbackCodeBlock }; 
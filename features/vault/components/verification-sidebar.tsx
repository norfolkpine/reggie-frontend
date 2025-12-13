import React, { useEffect, useState, useRef } from 'react';
import { X, FileText, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExtractionCell, DocumentFile, Column } from '../types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerificationSidebarProps {
  cell?: ExtractionCell | null;
  document: DocumentFile | null;
  column?: Column | null;
  onClose: () => void;
  onVerify?: () => void;
  isExpanded: boolean;
  onExpand: (expanded: boolean) => void;
}

export const VerificationSidebar: React.FC<VerificationSidebarProps> = ({
  cell,
  document,
  column,
  onClose,
  isExpanded,
  onExpand
}) => {
  const [decodedContent, setDecodedContent] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (document) {
        try {
            const cleanContent = document.content.replace(/^data:.*;base64,/, '');
            const binaryString = atob(cleanContent);
            try {
                const decoded = decodeURIComponent(escape(binaryString));
                setDecodedContent(decoded);
        } catch (e) {
                console.error("Unicode decoding error", e);
                setDecodedContent(binaryString);
            }
        } catch (e) {
            console.error("Decoding error", e);
            setDecodedContent("Unable to display document content.");
        }
    }
  }, [document]);

  useEffect(() => {
    if (isExpanded && cell?.quote) {
        const timer = setTimeout(() => {
            if (scrollContainerRef.current) {
                const mark = scrollContainerRef.current.querySelector('mark');
                if (mark) {
                    mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [isExpanded, cell, decodedContent]);

  const handleCitationClick = () => {
    onExpand(true);
  };

  const renderHighlightedContent = () => {
    if (!cell || !cell.quote || !decodedContent) {
      return (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {decodedContent}
        </div>
      );
    }

    const quote = cell.quote.trim();
    if (!quote) {
      return (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {decodedContent}
        </div>
      );
    }

    const escapedQuote = quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const loosePattern = escapedQuote.replace(/\s+/g, '\\s+');
    const looseQuoteRegex = new RegExp(`(${loosePattern})`, 'gi');

    const parts = decodedContent.split(looseQuoteRegex);

    if (parts.length === 1) {
        return (
            <div className="relative">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
                    Exact quote not found. Showing full text.
            </AlertDescription>
          </Alert>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {decodedContent}
                </div>
            </div>
        );
    }

    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {parts.map((part, i) => {
                const isMatch = looseQuoteRegex.test(part);
                looseQuoteRegex.lastIndex = 0; 

                if (isMatch) {
                    return (
              <mark
                key={i}
                className="bg-primary/20 text-foreground px-0.5 rounded-sm border-b-2 border-primary font-medium"
              >
                            {part}
                        </mark>
                    );
                }
                return <React.Fragment key={i}>{part}</React.Fragment>;
            })}
        </div>
    );
  };

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return 'default';
      case 'Medium':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const renderAnswerPanel = () => (
    <Card className="flex flex-col h-full rounded-none border-0 border-r">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FileText className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
            <CardDescription className="text-[10px] uppercase tracking-wider font-bold">
                        {cell ? 'Analyst Review' : 'Document Preview'}
            </CardDescription>
            <CardTitle className="text-sm font-semibold truncate max-w-[200px]" title={document?.name}>
                        {document?.name}
            </CardTitle>
                </div>
            </div>
            <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                    onClick={() => onExpand(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isExpanded ? 'Collapse' : 'Expand to show document'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 overflow-hidden p-0">
        {cell && column ? (
          <ScrollArea className="h-full">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider">
                        {column.name}
                </Badge>
                <Badge variant={getConfidenceBadgeVariant(cell.confidence)}>
                        {cell.confidence} Confidence
                </Badge>
                </div>

                <div className="mb-8">
                <p className="text-lg text-foreground leading-relaxed font-medium">
                        {cell.value}
                </p>
                </div>
                
                <div className="space-y-4">
                    <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    AI Reasoning
                  </h4>
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <p className="text-sm text-muted-foreground leading-relaxed inline">
                                {cell.reasoning}
                            </p>
                            
                            {cell.quote && (
                        <Button
                          variant="secondary"
                          size="sm"
                                    onClick={handleCitationClick}
                          className="inline-flex ml-1.5 align-middle h-5 px-1.5 text-[10px] font-bold"
                                >
                                    {cell.page ? `p.${cell.page}` : 'Src'}
                        </Button>
                            )}
                    </CardContent>
                  </Card>
                </div>
                </div>
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-6">
                {decodedContent ? (
                <Card>
                  <CardContent className="p-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-mono">
                            {decodedContent}
                        </pre>
                  </CardContent>
                </Card>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">No content available</p>
                        {!isExpanded && (
                    <Button variant="link" onClick={() => onExpand(true)} className="mt-4">
                                Open Document Viewer
                    </Button>
                        )}
                    </div>
                )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );

  const renderDocumentPanel = () => (
    <div className="h-full flex flex-col bg-muted border-l overflow-hidden">
      <div className="flex-1 bg-muted/50 relative flex flex-col min-h-0">
        <ScrollArea className="flex-1" ref={scrollContainerRef}>
          <div className="p-8 md:p-12">
            <Card className="max-w-[800px] w-full min-h-[800px] mx-auto">
              <CardContent className="p-8 md:p-12 text-left">
                        {renderHighlightedContent()}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
          </div>
      </div>
  );

  if (!document) return null;

  return (
    <TooltipProvider>
    <div className="h-full w-full flex">
        <div
          className={cn(
            'flex-shrink-0 transition-all duration-300 z-20',
            isExpanded ? 'w-[400px]' : 'w-full'
          )}
        >
             {renderAnswerPanel()}
        </div>

        {isExpanded && (
            <div className="flex-1 animate-in slide-in-from-right duration-300 min-w-0">
                {renderDocumentPanel()}
            </div>
        )}
    </div>
    </TooltipProvider>
  );
};

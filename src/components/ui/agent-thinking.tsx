"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Code2, 
  CheckCircle, 
  Loader2, 
  ChevronRight, 
  Clock,
  Zap,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ToolCall {
  id: string;
  toolName: string;
  toolArgs: any;
  status: 'started' | 'completed' | 'error';
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
}

interface ReasoningStep {
  title: string;
  reasoning: string;
  action?: string;
  result?: string;
  nextAction?: string;
  confidence?: number;
}

interface AgentThinkingProps {
  toolCalls?: ToolCall[];
  reasoningSteps?: ReasoningStep[];
  isActive?: boolean;
}

const ToolCallItem = ({ toolCall }: { toolCall: ToolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusIcon = () => {
    switch (toolCall.status) {
      case 'started':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <Code2 className="h-4 w-4 text-red-500" />;
      default:
        return <Code2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (toolCall.status) {
      case 'started':
        return 'Running...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getDuration = () => {
    if (toolCall.startTime && toolCall.endTime) {
      return ((toolCall.endTime - toolCall.startTime) / 1000).toFixed(2);
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-lg border bg-muted/30 p-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {toolCall.toolName}
              </span>
              <span className="text-xs text-muted-foreground">
                {getStatusText()}
              </span>
            </div>
            {getDuration() && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {getDuration()}s
              </div>
            )}
          </div>
        </div>
        
        {toolCall.status === 'completed' && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ChevronRight className={cn(
                  "h-3 w-3 transition-transform",
                  isExpanded && "rotate-90"
                )} />
                Details
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={false}
                animate={isExpanded ? "open" : "closed"}
                variants={{
                  open: { height: "auto", opacity: 1 },
                  closed: { height: 0, opacity: 0 },
                }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-2"
              >
                <div className="rounded border bg-background/50 p-2 max-w-full">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Arguments:
                  </div>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words max-w-full max-h-32 overflow-y-auto">
                    {JSON.stringify(toolCall.toolArgs, null, 2)}
                  </pre>
                </div>
                {toolCall.result && (
                  <div className="rounded border bg-background/50 p-2 max-w-full">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Result:
                    </div>
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words max-w-full max-h-32 overflow-y-auto">
                      {typeof toolCall.result === 'string' 
                        ? toolCall.result 
                        : JSON.stringify(toolCall.result, null, 2)
                      }
                    </pre>
                  </div>
                )}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </motion.div>
  );
};

const ReasoningStepItem = ({ step, index }: { step: ReasoningStep; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-lg border bg-muted/20 p-3"
    >
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-600">{index + 1}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium text-sm">{step.title}</h4>
            {step.confidence && (
              <span className="text-xs text-muted-foreground">
                {Math.round(step.confidence * 100)}% confidence
              </span>
            )}
          </div>
          
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <button className="text-left text-sm text-muted-foreground hover:text-foreground">
                {step.reasoning.length > 100 
                  ? `${step.reasoning.substring(0, 100)}...` 
                  : step.reasoning
                }
                <ChevronRight className={cn(
                  "h-3 w-3 inline ml-1 transition-transform",
                  isExpanded && "rotate-90"
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={false}
                animate={isExpanded ? "open" : "closed"}
                variants={{
                  open: { height: "auto", opacity: 1 },
                  closed: { height: 0, opacity: 0 },
                }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-2"
              >
                <div className="text-sm whitespace-pre-wrap">
                  {step.reasoning}
                </div>
                {step.action && (
                  <div className="text-xs">
                    <span className="font-medium text-muted-foreground">Action:</span> {step.action}
                  </div>
                )}
                {step.result && (
                  <div className="text-xs">
                    <span className="font-medium text-muted-foreground">Result:</span> {step.result}
                  </div>
                )}
                {step.nextAction && (
                  <div className="text-xs">
                    <span className="font-medium text-muted-foreground">Next:</span> {step.nextAction}
                  </div>
                )}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </motion.div>
  );
};

export const AgentThinking: React.FC<AgentThinkingProps> = ({
  toolCalls = [],
  reasoningSteps = [],
  isActive = false,
}) => {
  const [showReasoning, setShowReasoning] = useState(true);
  const [showToolCalls, setShowToolCalls] = useState(true);

  if (!toolCalls.length && !reasoningSteps.length) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Reasoning Steps */}
      {reasoningSteps.length > 0 && (
        <div className="rounded-lg border bg-muted/10 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-purple-500" />
            <h3 className="font-medium text-sm">Thinking Process</h3>
            {isActive && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            )}
            <Collapsible open={showReasoning} onOpenChange={setShowReasoning}>
              <CollapsibleTrigger asChild>
                <button className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <ChevronRight className={cn(
                    "h-3 w-3 transition-transform",
                    showReasoning && "rotate-90"
                  )} />
                  {showReasoning ? 'Hide' : 'Show'}
                </button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
          
          <Collapsible open={showReasoning}>
            <CollapsibleContent>
              <AnimatePresence>
                <div className="space-y-2">
                  {reasoningSteps.map((step, index) => (
                    <ReasoningStepItem key={index} step={step} index={index} />
                  ))}
                </div>
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Tool Calls */}
      {toolCalls.length > 0 && (
        <div className="rounded-lg border bg-muted/10 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-orange-500" />
            <h3 className="font-medium text-sm">Tools Used</h3>
            {isActive && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            )}
            <Collapsible open={showToolCalls} onOpenChange={setShowToolCalls}>
              <CollapsibleTrigger asChild>
                <button className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <ChevronRight className={cn(
                    "h-3 w-3 transition-transform",
                    showToolCalls && "rotate-90"
                  )} />
                  {showToolCalls ? 'Hide' : 'Show'}
                </button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
          
          <Collapsible open={showToolCalls}>
            <CollapsibleContent>
              <AnimatePresence>
                <div className="space-y-2">
                  {toolCalls.map((toolCall) => (
                    <ToolCallItem key={toolCall.id} toolCall={toolCall} />
                  ))}
                </div>
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </motion.div>
  );
}; 
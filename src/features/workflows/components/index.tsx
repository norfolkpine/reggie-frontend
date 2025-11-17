"use client"

import { StartNode } from './start-node';
import { EndNode } from './end-node';
import { AgentNode } from './agent-node';
import { StickyNoteNode } from './sticky-note-node';
import { DeletableEdge } from './deletable-edge';

// Triggers
import { WebhookTriggerNode } from './webhook-trigger-node';
import { CronTriggerNode } from './cron-trigger-node';
import { ManualTriggerNode } from './manual-trigger-node';

// Control & Flow
import { IfNode } from './if-node';
import { SwitchNode } from './switch-node';
import { ParallelSplitNode } from './parallel-split-node';
import { ParallelMergeNode } from './parallel-merge-node';
import { LoopNode } from './loop-node';
import { TimerNode } from './timer-node';
import { ErrorNode } from './error-node';

// Data & Transform
import { SetVariableNode } from './set-variable-node';
import { MapTransformNode } from './map-transform-node';
import { FunctionNode } from './function-node';

// Integrations
import { HttpRequestNode } from './http-request-node';
import { DatabaseQueryNode } from './database-query-node';
import { FileStorageNode } from './file-storage-node';
import { NotificationNode } from './notification-node';

// AI / Legal
import { ExtractEntitiesNode } from './extract-entities-node';
import { ComplianceCheckNode } from './compliance-check-node';
import { GenerateSummaryNode } from './generate-summary-node';
import { DocumentIngestNode } from './document-ingest-node';

// Human-in-the-Loop
import { ApprovalTaskNode } from './approval-task-node';
import { DataCorrectionNode } from './data-correction-node';

// Temporal / System
import { ChildWorkflowNode } from './child-workflow-node';
import { SignalWaitNode } from './signal-wait-node';

export const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  agentNode: AgentNode,
  stickyNoteNode: StickyNoteNode,
  // Triggers
  webhookTrigger: WebhookTriggerNode,
  cronTrigger: CronTriggerNode,
  manualTrigger: ManualTriggerNode,
  // Control & Flow
  ifNode: IfNode,
  switchNode: SwitchNode,
  parallelSplit: ParallelSplitNode,
  parallelMerge: ParallelMergeNode,
  loopNode: LoopNode,
  timerNode: TimerNode,
  errorNode: ErrorNode,
  // Data & Transform
  setVariable: SetVariableNode,
  mapTransform: MapTransformNode,
  functionNode: FunctionNode,
  // Integrations
  httpRequest: HttpRequestNode,
  databaseQuery: DatabaseQueryNode,
  fileStorage: FileStorageNode,
  notification: NotificationNode,
  // AI / Legal
  extractEntities: ExtractEntitiesNode,
  complianceCheck: ComplianceCheckNode,
  generateSummary: GenerateSummaryNode,
  documentIngest: DocumentIngestNode,
  // Human-in-the-Loop
  approvalTask: ApprovalTaskNode,
  dataCorrection: DataCorrectionNode,
  // Temporal / System
  childWorkflow: ChildWorkflowNode,
  signalWait: SignalWaitNode,
};

export const edgeTypes = {
  deletable: DeletableEdge,
};

export { 
  StartNode, 
  EndNode, 
  AgentNode, 
  StickyNoteNode, 
  DeletableEdge,
  WebhookTriggerNode,
  CronTriggerNode,
  ManualTriggerNode,
  IfNode,
  SwitchNode,
  ParallelSplitNode,
  ParallelMergeNode,
  LoopNode,
  TimerNode,
  ErrorNode,
  SetVariableNode,
  MapTransformNode,
  FunctionNode,
  HttpRequestNode,
  DatabaseQueryNode,
  FileStorageNode,
  NotificationNode,
  ExtractEntitiesNode,
  ComplianceCheckNode,
  GenerateSummaryNode,
  DocumentIngestNode,
  ApprovalTaskNode,
  DataCorrectionNode,
  ChildWorkflowNode,
  SignalWaitNode,
};


import { api } from '@/lib/api-client';
import {
  Workflow,
  PaginatedWorkflowList,
  PatchedWorkflow,
  WorkflowRun,
  PaginatedWorkflowRunList,
  WorkflowNode,
  PaginatedWorkflowNodeList,
  WorkflowNodesResponse,
  PatchedWorkflowNode,
  WorkflowEdge,
  PaginatedWorkflowEdgeList,
  WorkflowEdgesResponse,
  PatchedWorkflowEdge,
  WorkflowPermission,
} from '../types/api';

// ============================================================================
// Workflow Endpoints
// ============================================================================

/**
 * List all workflows accessible to the current user
 */
export const listWorkflows = async (): Promise<PaginatedWorkflowList> => {
  const response = await api.get('/opie/api/v1/workflows/');
  return response as PaginatedWorkflowList;
};

/**
 * Create a new workflow
 */
export const createWorkflow = async (data: Partial<Workflow>): Promise<Workflow> => {
  const response = await api.post('/opie/api/v1/workflows/', data);
  return response as Workflow;
};

/**
 * Retrieve a specific workflow by ID
 */
export const getWorkflow = async (id: number): Promise<Workflow> => {
  const response = await api.get(`/opie/api/v1/workflows/${id}/`);
  return response as Workflow;
};

/**
 * Update a workflow
 */
export const updateWorkflow = async (id: number, data: PatchedWorkflow): Promise<Workflow> => {
  const response = await api.patch(`/opie/api/v1/workflows/${id}/`, data);
  return response as Workflow;
};

/**
 * Delete a workflow
 */
export const deleteWorkflow = async (id: number): Promise<void> => {
  await api.delete(`/opie/api/v1/workflows/${id}/`);
};

/**
 * Share workflow with teams
 */
export const shareWorkflow = async (
  id: number,
  permissions: Partial<WorkflowPermission>[]
): Promise<{ status: string }> => {
  const response = await api.post(`/opie/api/v1/workflows/${id}/share/`, permissions);
  return response as { status: string };
};

/**
 * Execute a workflow
 */
export const runWorkflow = async (
  id: number,
  data?: {
    session_id?: string;
    execution_mode?: 'sequential' | 'parallel';
  }
): Promise<{
  workflow_run_id: number;
  status: string;
  result?: any;
  error?: string;
}> => {
  const response = await api.post(`/opie/api/v1/workflows/${id}/run/`, data || {});
  return response as {
    workflow_run_id: number;
    status: string;
    result?: any;
    error?: string;
  };
};

// ============================================================================
// Workflow Run Endpoints
// ============================================================================

/**
 * List all workflow runs accessible to the current user
 */
export const listWorkflowRuns = async (): Promise<PaginatedWorkflowRunList> => {
  const response = await api.get('/opie/api/v1/workflow-runs/');
  return response as PaginatedWorkflowRunList;
};

/**
 * Retrieve a specific workflow run by ID
 */
export const getWorkflowRun = async (id: number): Promise<WorkflowRun> => {
  const response = await api.get(`/opie/api/v1/workflow-runs/${id}/`);
  return response as WorkflowRun;
};

// ============================================================================
// Workflow Node Endpoints
// ============================================================================

/**
 * List all workflow nodes accessible to the current user
 */
export const listWorkflowNodes = async (): Promise<PaginatedWorkflowNodeList> => {
  const response = await api.get('/opie/api/v1/workflow-nodes/');
  return response as PaginatedWorkflowNodeList;
};

/**
 * Get nodes by workflow ID
 */
export const getNodesByWorkflow = async (workflowId: number): Promise<WorkflowNodesResponse> => {
  const response = await api.get(`/opie/api/v1/workflow-nodes/by-workflow/`, {
    params: { workflow_id: workflowId.toString() },
  });
  return response as WorkflowNodesResponse;
};

/**
 * Create a new workflow node
 */
export const createWorkflowNode = async (data: Partial<WorkflowNode>): Promise<WorkflowNode> => {
  const response = await api.post('/opie/api/v1/workflow-nodes/', data);
  return response as WorkflowNode;
};

/**
 * Add a node to a workflow (alternative endpoint)
 */
export const addNodeToWorkflow = async (data: {
  workflow_id: number;
  name: string;
  node_type: string;
  position_x: number;
  position_y: number;
  config?: Record<string, any>;
}): Promise<WorkflowNode> => {
  const response = await api.post('/opie/api/v1/workflow-nodes/add-node/', data);
  return response as WorkflowNode;
};

/**
 * Retrieve a specific workflow node by ID
 */
export const getWorkflowNode = async (id: number): Promise<WorkflowNode> => {
  const response = await api.get(`/opie/api/v1/workflow-nodes/${id}/`);
  return response as WorkflowNode;
};

/**
 * Update a workflow node
 */
export const updateWorkflowNode = async (
  id: number,
  data: PatchedWorkflowNode
): Promise<WorkflowNode> => {
  const response = await api.patch(`/opie/api/v1/workflow-nodes/${id}/`, data);
  return response as WorkflowNode;
};

/**
 * Delete a workflow node
 */
export const deleteWorkflowNode = async (id: number): Promise<void> => {
  await api.delete(`/opie/api/v1/workflow-nodes/${id}/`);
};

// ============================================================================
// Workflow Edge Endpoints
// ============================================================================

/**
 * List all workflow edges accessible to the current user
 */
export const listWorkflowEdges = async (): Promise<PaginatedWorkflowEdgeList> => {
  const response = await api.get('/opie/api/v1/workflow-edges/');
  return response as PaginatedWorkflowEdgeList;
};

/**
 * Get edges by workflow ID
 */
export const getEdgesByWorkflow = async (workflowId: number): Promise<WorkflowEdgesResponse> => {
  const response = await api.get(`/opie/api/v1/workflow-edges/by-workflow/`, {
    params: { workflow_id: workflowId.toString() },
  });
  return response as WorkflowEdgesResponse;
};

/**
 * Create a new workflow edge
 */
export const createWorkflowEdge = async (data: Partial<WorkflowEdge>): Promise<WorkflowEdge> => {
  const response = await api.post('/opie/api/v1/workflow-edges/', data);
  return response as WorkflowEdge;
};

/**
 * Retrieve a specific workflow edge by ID
 */
export const getWorkflowEdge = async (id: number): Promise<WorkflowEdge> => {
  const response = await api.get(`/opie/api/v1/workflow-edges/${id}/`);
  return response as WorkflowEdge;
};

/**
 * Update a workflow edge
 */
export const updateWorkflowEdge = async (
  id: number,
  data: PatchedWorkflowEdge
): Promise<WorkflowEdge> => {
  const response = await api.patch(`/opie/api/v1/workflow-edges/${id}/`, data);
  return response as WorkflowEdge;
};

/**
 * Delete a workflow edge
 */
export const deleteWorkflowEdge = async (id: number): Promise<void> => {
  await api.delete(`/opie/api/v1/workflow-edges/${id}/`);
};

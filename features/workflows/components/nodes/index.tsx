"use client"

import { StartNode } from './start-node';
import { EndNode } from './end-node';
import { AgentNode } from './agent-node';
import { StickyNoteNode } from './sticky-note-node';
import { DeletableEdge } from './deletable-edge';

export const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  agentNode: AgentNode,
  stickyNoteNode: StickyNoteNode,
};

export const edgeTypes = {
  deletable: DeletableEdge,
};

export { StartNode, EndNode, AgentNode, StickyNoteNode, DeletableEdge };


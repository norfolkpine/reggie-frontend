export type AgentForm = {
  name?: string;
  description?: string;
  systemTemplateId?: string;
  expectedTemplateId?: string;
  systemMessage?: string;
  expectedOutput?: string;
  model?: string;
  files?: UploadedFile[];
  urls?: UrlResource[];
  isCite?: boolean;
  limitPrompts?: number;
  limitCompletions?: number;
  limitMessages?: number;
  knowledgeBaseId?: number | null;
  searchKnowledge?: boolean;
  citeKnowledge?: boolean;
};

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export type UrlResource = {
  id: string;
  url: string;
  status: "pending" | "scraped" | "error";
  addedAt: Date;
};

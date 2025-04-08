export type AgentForm = {
  name?: string;
  description?: string;
  initialMessage?: string;
  systemMessage?: string;
  expectedOutput?: string;
  temperature?: number;
  model?: string;
  files?: UploadedFile[];
  urls?: UrlResource[];
  isCite?: boolean;
  limitPrompts?: number;
  limitCompletions?: number;
  limitMessages?: number;
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

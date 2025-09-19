export interface Reference {
  content: string;
  meta_data: {
    file_uuid: string;
    user_uuid: string;
    ingested_at: string;
    knowledgebase_id: string;
    link_id: string;
    page_label: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    last_modified_date: string;
  };
}

export interface ReferencesData {
  query: string;
  references: Reference[];
}

export type Message = { 
    id: string;
    content: string;
    role: 'system' | 'user' | 'assistant';
    references?: ReferencesData[];
    feedback?: any[];
    toolCalls?: any[];
    reasoningSteps?: any[];
    experimental_attachments?: { name: string; contentType: string; url: string }[];
}

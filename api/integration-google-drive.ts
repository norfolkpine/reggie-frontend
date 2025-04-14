import { api } from '@/lib/api-client';

export const startGoogleDriveAuth = async () => {
  const response = await api.get('/integrations/gdrive/oauth/start/');
  return response;
};

export const handleGoogleDriveCallback = async () => {
  const response = await api.get('/integrations/gdrive/oauth/callback/');
  return response;
};

export const revokeGoogleDriveAccess = async () => {
  await api.post('/integrations/gdrive/revoke/');
};

export const listGoogleDriveFiles = async () => {
  const response = await api.get('/integrations/gdrive/files/');
  return response;
};

export const uploadToGoogleDrive = async (file: FormData) => {
  const response = await api.post('/integrations/gdrive/upload/', file);
  return response;
};

export const downloadFromGoogleDrive = async (fileId: string) => {
  const response = await api.get(`/integrations/gdrive/download/${fileId}/`);
  return response;
};

interface CreateGoogleDocParams {
  markdown: string;
  title?: string;
}

interface GoogleDocResponse {
  file_id: string;
  doc_url: string;
  title: string;
}

export const createGoogleDoc = async (params: CreateGoogleDocParams) => {
  const response = await api.post('/integrations/gdrive/docs/markdown/', params);
  return response as GoogleDocResponse;
};
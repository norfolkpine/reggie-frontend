import { api } from '@/lib/api-client';

export interface Integration {
  key: string;
  title: string;
  description: string;
  icon_url: string;
  is_connected: boolean | false;
}

export interface NangoConnection {
  provider: string;
  user_id: number;
  connection_id: string;
}

interface PaginatedIntegrationList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Integration[];
}

interface PaginatedConnectionList {
  count: number;
  next: string | null;
  previous: string | null;
  results: NangoConnection[];
}

interface Connection {
  prividor: string;
  connectionId: string | undefined;
}

export const getIntegrations = async (page: number = 1) => {
  const response = await api.get('/integrations/apps/', {
    params: { page: page.toString() }
  });
  return response as Integration[];
};

export const getConnections = async (page: number = 1) => {
  const response = await api.get('/integrations/conections/', {
    params: { page: page.toString() }
  });
  return response as NangoConnection[];
};

export const getNangoSessions = async () => {
  const response = await api.get('/integrations/nangosession/');
  return response;
};

export const revokeAccess = async (revoke_provider: String) => {
  const response = await api.post('/integrations/revokesession/', revoke_provider);
  return response;
};

export const saveNangoConnection = async (connectionData : Connection) => {
  const response = await api.post('/integrations/connectionsave/', connectionData);
  return response;
};

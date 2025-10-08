import { api } from '@/lib/api-client';
import { type } from 'os';

export interface Integration {
  key: string;
  title: string;
  description: string;
  icon_url: string;
  is_connected: boolean | false;
}

// Nango integration interface based on the API documentation
export interface NangoIntegration {
  unique_key: string;
  display_name: string;
  provider: string;
  logo: string;
  created_at: string;
  updated_at: string;
}

export interface NangoIntegrationsResponse {
  data: NangoIntegration[];
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
  provider: string;
  connectionId: string | undefined;
}

interface NangoSession {
  token: string;
}

export const getIntegrations = async (page: number = 1) => {
  const response = await api.get('/integrations/apps/', {
    params: { page: page.toString() }
  });
  
  // Transform the response data to match the Integration interface
  const data = response as any;
  const integrations = data.data || data.results || data;
  
  return integrations.map((integration: any) => ({
    key: integration.key,
    title: integration.title,
    description: `Provider: ${integration.provider}`,
    icon_url: integration.icon_url,
    is_connected: false, // This will be updated based on connections
  })) as Integration[];
};

export const getConnections = async (page: number = 1) => {
  const response = await api.get('/integrations/conections/', {
    params: { page: page.toString() }
  });
  return response as NangoConnection[];
};


export const revokeAccess = async (revoke_provider: String) => {
  const response = await api.post('/integrations/revokesession/', revoke_provider);
  return response;
};

export const saveNangoConnection = async (connectionData : Connection) => {
  const response = await api.post('/integrations/connectionsave/', connectionData);
  return response;
};

// Convert Nango integration to Integration format
export const convertNangoIntegrationToIntegration = (integration: NangoIntegration): Integration => {
  return {
    key: integration.unique_key,
    title: integration.display_name,
    description: `Provider: ${integration.provider}`,
    icon_url: integration.logo,
    is_connected: false, // This will be updated based on connections if needed
  };
};

// Fetch integrations from Nango API
export const getNangoIntegrations = async (): Promise<Integration[]> => {
  const nangoApiUrl = process.env.NEXT_PUBLIC_NANGO_API_URL;
  const nangoToken = process.env.NEXT_PUBLIC_NANGO_SECRET_KEY;

  if (!nangoApiUrl || !nangoToken) {
    throw new Error('Nango API URL and secret key must be configured');
  }

  const response = await fetch(`${nangoApiUrl}/integrations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${nangoToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Nango integrations: ${response.status} ${response.statusText}`);
  }

  const data: NangoIntegrationsResponse = await response.json();
  return data.data.map(convertNangoIntegrationToIntegration);
};

// Create a Nango connect session
export const createNangoSession = async (integration: string): Promise<string> => {
  console.log(`[API] Creating Nango session for integration: ${integration}`);
  try {
    const response = await api.post('/integrations/nangosession/', { integration });
    const data = response as any;

    const token = data.token as string;
    console.log((typeof token))
    return token;
  } catch (error) {
    console.error(`[API] Session creation failed:`, error);
    throw error;
  }
};

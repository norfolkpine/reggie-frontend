import { api } from '@/lib/api-client';

export interface Integration {
  key: string;
  title: string;
  description: string;
  icon_url: string;
  is_connected: boolean | false;
}

// Nango provider interface based on the API documentation
export interface NangoProvider {
  name: string;
  display_name: string;
  categories: string[];
  auth_mode: string;
  authorization_url?: string;
  token_url?: string;
  connection_configuration?: string[];
  post_connection_script?: string;
  webhook_routing_script?: string;
  proxy?: {
    base_url: string;
    decompress?: boolean;
    paginate?: {
      type: string;
      cursor_path_in_response: string;
      limit_name_in_request: string;
      cursor_name_in_request: string;
      response_path: string;
    };
  };
  docs: string;
}

export interface NangoProvidersResponse {
  data: NangoProvider[];
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


// Fetch providers from Nango API
export const getNangoProviders = async (): Promise<NangoProvider[]> => {
  const nangoApiUrl = process.env.NEXT_PUBLIC_NANGO_API_URL;
  const nangoToken = process.env.NEXT_PUBLIC_NANGO_SECRET_KEY;
  
  if (!nangoApiUrl || !nangoToken) {
    throw new Error('Nango API URL and secret key must be configured');
  }

  const response = await fetch(`${nangoApiUrl}/providers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${nangoToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Nango providers: ${response.status} ${response.statusText}`);
  }

  const data: NangoProvidersResponse = await response.json();
  return data.data;
};

// Convert Nango provider to Integration format
export const convertNangoProviderToIntegration = (provider: NangoProvider): Integration => {
  return {
    key: provider.name,
    title: provider.display_name,
    description: provider.categories.join(', '),
    icon_url: '', // Nango doesn't provide icon URLs in the API response
    is_connected: false, // This will be updated based on connections
  };
};

// Legacy function - now uses Nango providers instead of Django
export const getIntegrations = async (page: number = 1): Promise<Integration[]> => {
  try {
    const providers = await getNangoProviders();
    return providers.map(convertNangoProviderToIntegration);
  } catch (error) {
    console.error('Failed to fetch Nango providers:', error);
    // Return empty array as fallback
    return [];
  }
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


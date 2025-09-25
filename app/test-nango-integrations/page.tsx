"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/custom/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ExternalLink } from "lucide-react";
import { getNangoSessions, saveNangoConnection } from "@/api/integrations";
import Nango from '@nangohq/frontend';
import { useToast } from "@/components/ui/use-toast";

// Nango integration interface based on the API documentation
interface NangoIntegration {
  unique_key: string;
  display_name: string;
  provider: string;
  logo: string;
  created_at: string;
  updated_at: string;
}

interface NangoIntegrationsResponse {
  data: NangoIntegration[];
}

// Convert Nango integration to Integration format
const convertNangoIntegrationToIntegration = (integration: NangoIntegration) => {
  return {
    key: integration.unique_key,
    title: integration.display_name,
    description: `Provider: ${integration.provider}`,
    icon_url: integration.logo,
    is_connected: false, // This will be updated based on connections
  };
};

// Fetch integrations from Nango API
const getNangoIntegrations = async (): Promise<NangoIntegration[]> => {
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
  return data.data;
};

export default function TestNangoIntegrations() {
  const [integrations, setIntegrations] = useState<NangoIntegration[]>([]);
  const [convertedIntegrations, setConvertedIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [nangoSessionToken, setNangoSessionToken] = useState<string | null>(null);
  const [nangoConnect, setNangoConnect] = useState<any>(null);
  const [nango, setNango] = useState<Nango | null>(null);
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching Nango integrations...");
      const nangoIntegrations = await getNangoIntegrations();
      console.log("Raw Nango integrations:", nangoIntegrations);
      
      setIntegrations(nangoIntegrations);
      
      // Convert to integration format
      const converted = nangoIntegrations.map(convertNangoIntegrationToIntegration);
      console.log("Converted integrations:", converted);
      
      setConvertedIntegrations(converted);
    } catch (err) {
      console.error("Error fetching integrations:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const initializeConnectUI = (integrationKey: string) => {
    if (nangoConnect) {
      console.log('[Nango] Using existing Connect UI instance');
      return nangoConnect;
    }

    if (!nango || !nangoSessionToken) {
      console.error('[Nango] Cannot initialize Connect UI: missing nango instance or session token');
      return null;
    }

    console.log('[Nango] Initializing new Connect UI...');

    try {
      if (!process.env.NEXT_PUBLIC_NANGO_API_URL || !process.env.NEXT_PUBLIC_NANGO_BASE_URL) {
        console.error('[Nango] Missing required environment variables: NEXT_PUBLIC_NANGO_API_URL or NEXT_PUBLIC_NANGO_BASE_URL');
        toast({
          title: "Configuration Error",
          description: "Nango configuration is missing. Please contact support.",
          variant: "destructive",
        });
        return null;
      }

      const connectUI = nango.openConnectUI({
        apiURL: process.env.NEXT_PUBLIC_NANGO_API_URL,
        baseURL: process.env.NEXT_PUBLIC_NANGO_BASE_URL,
        onEvent: (event) => {
          console.log('[Nango] Connect UI event:', event);
          try {
            if (event.type === 'connect') {
              const eventData = event.payload || {};
              console.log('[Nango] Event data structure:', { payload: event.payload });

              const { connectionId, providerConfigKey } = eventData;
              const actualProvider = (eventData as any).provider ?? providerConfigKey;

              if (!actualProvider || !connectionId) {
                console.error('[Nango] Missing required connection data:', { actualProvider, connectionId });
                toast({
                  title: "Connection Error",
                  description: "Invalid connection data received. Please try again.",
                  variant: "destructive",
                });
                return;
              }

              console.log(`[Nango] Successfully connected to ${actualProvider} with connection ID: ${connectionId}`);

              // Show success toast
              toast({
                title: "Connection Successful",
                description: `Successfully connected to ${integrationKey}`,
              });

              // Save the connection to database
              console.log('[Nango] Saving connection to database...', { provider: actualProvider, connectionId });
              
              const handleConnectionSave = async () => {
                console.log('[Nango] Waiting for webhook processing...');
                await new Promise(resolve => setTimeout(resolve, 1000));

                try {
                  console.log('[Nango] Attempting to save connection:', {
                    provider: actualProvider,
                    connectionId
                  });

                  try {
                    const connectionData = {
                      provider: actualProvider,
                      connectionId: connectionId || undefined
                    };

                    const saveResponse = await saveNangoConnection(connectionData);

                    if (saveResponse && typeof saveResponse === 'object') {
                      const saveData = saveResponse as any;
                      
                      if (!saveData.id) {
                        if (!saveData.error?.includes('duplicate')) {
                          console.error('[Nango] Failed to save connection:', saveData);
                        }
                      } else {
                        console.log('[Nango] Save request completed:', saveData);
                        // Refresh the integrations list to show updated connection status
                        await fetchIntegrations();
                      }
                    }
                  } catch (error) {
                    console.log('[Nango] Save request failed, but webhook may have saved it:', error);
                  }

                } catch (error) {
                  console.error('[Nango] ❌ Error in save/verify process:', error);
                }
              };

              handleConnectionSave();

              setNangoConnect(null);
            } else if (event.type === 'close') {
              console.log('[Nango] Connect UI closed');
            }
          } catch (error) {
            console.error('[Nango] Error handling event:', error);
            console.error('[Nango] Event that caused error:', event);
          }
        }
      });

      console.log("connectUI", connectUI);
      console.log(`[Nango] Setting session token: ${nangoSessionToken}`);
      console.log(`[Nango] Session token type:`, typeof nangoSessionToken);
      console.log(`[Nango] Session token length:`, nangoSessionToken?.length);
      
      if (!nangoSessionToken || nangoSessionToken === 'undefined' || nangoSessionToken === 'null') {
        console.error('[Nango] Invalid session token:', nangoSessionToken);
        toast({
          title: "Authentication Error",
          description: "Invalid session token. Please refresh the page and try again.",
          variant: "destructive",
        });
        return null;
      }
      
      connectUI.setSessionToken(nangoSessionToken);
      setNangoConnect(connectUI);
      console.log(`[Nango] Connect UI initialized and ready`);

      return connectUI;
    } catch (error) {
      console.error('[Nango] Error initializing Connect UI:', error);
      return null;
    }
  };

  const handleConnect = async (integrationKey: string) => {
    setConnecting(integrationKey);
    setError(null);
    
    try {
      console.log(`[Nango] Attempting to connect to ${integrationKey}`);
      console.log(`[Nango] Nango instance:`, nango);
      console.log(`[Nango] Session token:`, nangoSessionToken);
      console.log(`[Nango] API URL:`, process.env.NEXT_PUBLIC_NANGO_API_URL);
      console.log(`[Nango] Base URL:`, process.env.NEXT_PUBLIC_NANGO_BASE_URL);
      
      if (!nango || !nangoSessionToken) {
        console.error('[Nango] Cannot connect: missing nango instance or session token');
        console.error('[Nango] Nango instance exists:', !!nango);
        console.error('[Nango] Session token exists:', !!nangoSessionToken);
        toast({
          title: "Connection Error",
          description: "Unable to initialize connection. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const connectUI = initializeConnectUI(integrationKey);
      if (!connectUI) {
        console.error('[Nango] Connect UI initialization failed');
        toast({
          title: "Connection Error", 
          description: "Failed to initialize connection UI. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log(`[Nango] Opening Connect UI for ${integrationKey}`);
      
      // Use a small delay to ensure the UI is ready
      setTimeout(() => {
        try {
          console.log(`[Nango] About to call connectUI.open(${integrationKey})`);
          connectUI.open(integrationKey);
          console.log(`[Nango] connectUI.open() called successfully`);
        } catch (error) {
          console.error(`[Nango] Error opening Connect UI for ${integrationKey}:`, error);
          toast({
            title: "Connection Error",
            description: "Failed to open connection dialog. Please try again.",
            variant: "destructive",
          });
        }
      }, 100);
      
    } catch (err) {
      console.error('Nango connect error:', err);
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  // Initialize Nango
  useEffect(() => {
    const initNango = async () => {
      try {
        console.log('[Nango] Starting initialization...');
        const response = await getNangoSessions();
        console.log('[Nango] Raw response from getNangoSessions:', response);

        if (response && typeof response === 'object' && 'data' in response && 'token' in (response as any).data) {
          const sessionToken = (response as any).data.token;
          console.log('[Nango] Session token received:', sessionToken);
          console.log('[Nango] Session token type:', typeof sessionToken);
          console.log('[Nango] Session token length:', sessionToken?.length);
          
          if (!sessionToken || sessionToken === 'undefined' || sessionToken === 'null') {
            console.error('[Nango] Invalid session token received from backend:', sessionToken);
            throw new Error('Invalid session token received from backend');
          }
          
          setNangoSessionToken(sessionToken);

          const nangoInstance = new Nango();
          setNango(nangoInstance);
          console.log('[Nango] Nango instance created:', nangoInstance);

          console.log('[Nango] Session token stored, Connect UI will be initialized on demand');
        } else {
          console.error('[Nango] Failed to get Connect session token. Response structure:', response);
          console.error('[Nango] Response type:', typeof response);
          console.error('[Nango] Has data property:', response && typeof response === 'object' && 'data' in response);
          console.error('[Nango] Has token in data:', response && typeof response === 'object' && 'data' in response && 'token' in (response as any).data);
          
          // For development, create a mock session token if the API is not working
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Nango] Development mode: Creating mock session token');
            const mockToken = 'mock-session-token-' + Date.now();
            setNangoSessionToken(mockToken);
            
            const nangoInstance = new Nango();
            setNango(nangoInstance);
            console.log('[Nango] Mock Nango instance created for development');
          }
        }
      } catch (error) {
        console.error('[Nango] Initialization error:', error);
        
        // For development, create a mock session token if the API call fails
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Nango] Development mode: API call failed, creating mock session token');
          const mockToken = 'mock-session-token-' + Date.now();
          setNangoSessionToken(mockToken);
          
          const nangoInstance = new Nango();
          setNango(nangoInstance);
          console.log('[Nango] Mock Nango instance created for development after API error');
        }
      }
    };
    initNango();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Nango Integrations Test Page</h1>
        <p className="text-muted-foreground">
          Test page for fetching and displaying Nango integrations directly from the API.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This uses the <a 
            href="https://docs.nango.dev/reference/api/integration/list" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center"
          >
            /integrations endpoint
            <ExternalLink className="ml-1 h-3 w-3" />
          </a> which returns actual integrations with logos.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={fetchIntegrations} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Refresh Integrations"
          )}
        </Button>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Raw Nango Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Nango Integrations ({integrations.length})</CardTitle>
            <CardDescription>
              Direct response from Nango /integrations API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {integrations.length > 0 ? (
              <div className="space-y-4">
                {integrations.slice(0, 5).map((integration, index) => (
                  <div key={integration.unique_key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {integration.logo && (
                          <img 
                            src={integration.logo} 
                            alt={`${integration.display_name} logo`}
                            className="h-8 w-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <h3 className="font-semibold">{integration.display_name}</h3>
                      </div>
                      <Badge variant="outline">{integration.unique_key}</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Provider:</strong> {integration.provider}</p>
                      <p><strong>Created:</strong> {new Date(integration.created_at).toLocaleDateString()}</p>
                      <p><strong>Updated:</strong> {new Date(integration.updated_at).toLocaleDateString()}</p>
                      {integration.logo && (
                        <p><strong>Logo URL:</strong> 
                          <a 
                            href={integration.logo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-600 hover:underline inline-flex items-center"
                          >
                            {integration.logo}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {integrations.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ... and {integrations.length - 5} more integrations
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No integrations loaded</p>
            )}
          </CardContent>
        </Card>

        {/* Converted Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Converted Integrations ({convertedIntegrations.length})</CardTitle>
            <CardDescription>
              Nango integrations converted to Integration format
            </CardDescription>
          </CardHeader>
          <CardContent>
            {convertedIntegrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {convertedIntegrations.slice(0, 12).map((integration, index) => (
                  <div key={integration.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {integration.icon_url && (
                          <img 
                            src={integration.icon_url} 
                            alt={`${integration.title} icon`}
                            className="h-8 w-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <h3 className="font-semibold">{integration.title}</h3>
                      </div>
                      <Badge variant="secondary">{integration.key}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {integration.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Connected: {integration.is_connected ? "Yes" : "No"}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleConnect(integration.key)}
                        disabled={connecting === integration.key}
                      >
                        {connecting === integration.key ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                {convertedIntegrations.length > 12 && (
                  <div className="col-span-full text-center text-sm text-muted-foreground">
                    ... and {convertedIntegrations.length - 12} more integrations
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No integrations loaded</p>
            )}
          </CardContent>
        </Card>

        {/* Environment Variables Check */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Check</CardTitle>
            <CardDescription>
              Verify required environment variables are set
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>NEXT_PUBLIC_NANGO_API_URL:</span>
                <Badge variant={process.env.NEXT_PUBLIC_NANGO_API_URL ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_NANGO_API_URL ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>NEXT_PUBLIC_NANGO_BASE_URL:</span>
                <Badge variant={process.env.NEXT_PUBLIC_NANGO_BASE_URL ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_NANGO_BASE_URL ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>NEXT_PUBLIC_NANGO_SECRET_KEY:</span>
                <Badge variant={process.env.NEXT_PUBLIC_NANGO_SECRET_KEY ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_NANGO_SECRET_KEY ? "Set" : "Missing"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  IconAdjustmentsHorizontal,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import ContentSection from "../components/content-section";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search } from "@/components/search";
import { Button } from "@/components/custom/button";
import { getIntegrations, getNangoIntegrations, NangoConnection, Integration, revokeAccess, saveNangoConnection, getConnections, createNangoSession } from "@/api/integrations";
import { EmptyState } from "@/components/ui/empty-state";
import { BASE_URL } from "@/lib/api-client";
import { revokeGoogleDriveAccess, startGoogleDriveAuth } from "@/api/integration-google-drive";
import { useToast } from "@/components/ui/use-toast";
import Nango from '@nangohq/frontend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Icons } from "@/components/icons";
import { isSafeUrl } from "@/lib/utils/url";
import { Provider } from "@radix-ui/react-toast";

const appText = new Map<string, string>([
  ["all", "All Apps"],
  ["connected", "Connected"],
  ["notConnected", "Not Connected"],
]);

export default function IntegrationsSettingsPage() {
  const [sort, setSort] = useState("ascending");
  const [appType, setAppType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Integration | null>(null);
  const [nangoSessionToken, setNangoSessionToken] = useState<string | null>(null);
  const [nangoConnect, setNangoConnect] = useState<any>(null);
  const [nango, setNango] = useState<Nango | null>(null);
  const [appIntegration, setIntegration] = useState<Integration | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // React Query for integrations
  const { data: integrationsData, isLoading: integrationsLoading, error: integrationsError } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => getIntegrations(), 
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // React Query for connections
  const { data: connectionsData, isLoading: connectionsLoading, error: connectionsError } = useQuery({
    queryKey: ['connections'],
    queryFn: () => getConnections(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Memoized processed integrations with connection status
  const apps = useMemo(() => {
    if (!integrationsData || !connectionsData) return [];

    const integrations = Array.isArray(integrationsData) ? integrationsData : (integrationsData as any)?.data || (integrationsData as any)?.results || [];
    const connections = Array.isArray(connectionsData) ? connectionsData : (connectionsData as any)?.data || (connectionsData as any)?.results || [];

    return integrations.map(integration => {
      const isConnected = connections?.some((connection: NangoConnection) => connection.provider === integration.key);
      return {
        ...integration,
        is_connected: isConnected
      };
    });
  }, [integrationsData, connectionsData]);

  // Handle visibility change to refetch data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ['integrations'] });
        queryClient.invalidateQueries({ queryKey: ['connections'] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  const handleConnectionApp = async (integration: Integration) => {
    if (integration.key === 'google_drive' && !integration.is_connected) {
      try {
        const redirectUrl = await startGoogleDriveAuth();
        window.open(redirectUrl, '_blank', 'width=500,height=700');
      } catch (err) {
        console.error('Failed to start Google Drive OAuth:', err);
      }
    }
  };

  useEffect(() => {
    const initNango = async () => {
      try {
        console.log('[Nango] Starting initialization...');

        // Create Nango instance without session token initially
        const nangoInstance = new Nango();
        setNango(nangoInstance);
        console.log('[Nango] Nango instance created');

      } catch (error) {
        console.error('[Nango] Initialization error:', error);
        console.error('[Nango] Error details:', error instanceof Error ? error.message : String(error));
      }
    };
    initNango();
  }, [toast]);

  const initializeConnectUI = async (integration: Integration) => {
    // Prevent multiple simultaneous initializations
    if (isInitializing) {
      console.log('[Nango] Connect UI is already being initialized, skipping...');
      return null;
    }

    if (nangoConnect) {
      console.log('[Nango] Using existing Connect UI instance');
      return nangoConnect;
    }

    setIsInitializing(true);

    if (!nango) {
      console.error('[Nango] Cannot initialize Connect UI: missing nango instance');
      setIsInitializing(false);
      return null;
    }

    // Create session token for this specific integration
    let sessionToken;
    try {
      console.log(`[Nango] Creating session token for integration: ${integration.key}`);
      sessionToken = await createNangoSession(integration.key);
      console.log(`[Nango] Session token received:`, sessionToken);
      console.log(`[Nango] Session token type:`, typeof sessionToken);
      console.log(`[Nango] Session token length:`, sessionToken?.length);
      setNangoSessionToken(sessionToken);
      console.log(`[Nango] Session token created successfully`);
    } catch (error) {
      console.error('[Nango] Failed to create session token:', error);
      setIsInitializing(false);
      toast({
        title: "Session Error",
        description: "Failed to create connection session. Please try again.",
        variant: "destructive",
      });
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
      
        detectClosedAuthWindow: true, // Enable popup close detection as fallback
        onEvent: (event) => {
          console.log('[Nango] Connect UI event:', event);
          try {
            if (event.type === 'connect') {
              const eventData = event.payload || {};
              console.log('[Nango] Event data structure:', { payload: event.payload });

              const { connectionId, providerConfigKey } = eventData;
              // Use providerConfigKey as the provider identifier if provider is not present
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
                description: `Successfully connected to ${integration.title}`,
              });

              // Save the connection to database
              console.log('[Nango] Saving connection to database...', { provider: actualProvider, connectionId });

              const               handleConnectionSave = async () => {
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
                        // Invalidate and refetch connections to update UI
                        queryClient.invalidateQueries({ queryKey: ['connections'] });
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
              
              // Force cleanup of any remaining DOM elements
              setTimeout(() => {
                console.log('[Nango] Cleaning up leftover DOM elements...');
                
                // Remove all possible Connect UI elements
                const selectors = [
                  'iframe[src*="connect"]',
                  'iframe[src*="opie.sh"]',
                  '[data-nango-connect]',
                  '.nango-connect',
                  '#nango-connect',
                  '.modal-overlay',
                  '.modal-backdrop',
                  '[role="dialog"]',
                  '.connect-ui-modal',
                  '.nango-modal'
                ];
                
                selectors.forEach(selector => {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(element => {
                    console.log(`[Nango] Removing: ${selector}`);
                    element.remove();
                  });
                });
                
                // Restore page interactions
                document.body.style.pointerEvents = '';
                document.body.style.overflow = '';
                document.body.style.position = '';
                
                // Remove any blocking styles from all elements
                const allElements = document.querySelectorAll('*');
                allElements.forEach(element => {
                  if (element instanceof HTMLElement) {
                    element.style.pointerEvents = '';
                    element.style.userSelect = '';
                    element.style.position = '';
                  }
                });
                
                console.log('[Nango] Cleanup completed');
              }, 100);
            }
          } catch (error) {
            console.error('[Nango] Error handling event:', error);
            console.error('[Nango] Event that caused error:', event);
          }
        }
      });

      console.log("connectUI", connectUI);
      console.log(`[Nango] Setting session token: ${sessionToken}`);
      console.log(`[Nango] Session token is truthy:`, !!sessionToken);
      console.log(`[Nango] Session token value:`, sessionToken);
      
      if (sessionToken) {
        console.log(`[Nango] About to set session token on Connect UI`);
        connectUI.setSessionToken(sessionToken);
        setNangoConnect(connectUI);
        console.log(`[Nango] Connect UI initialized and ready`);
      } else {
        console.error('[Nango] Session token is null, cannot set session token');
        console.error('[Nango] Session token value:', sessionToken);
        return null;
      }

      setIsInitializing(false);
      return connectUI;
    } catch (error) {
      console.error('[Nango] Error initializing Connect UI:', error);
      setIsInitializing(false);
      return null;
    }
  };

  const handleConnect = async (integration: Integration) => {
    setIntegration(integration);
    try {
      console.log(`[Nango] Attempting to connect to ${integration.title} with provider ID: ${integration.key}`);
      console.log(`[Nango] Nango instance:`, nango);
      console.log(`[Nango] API URL:`, process.env.NEXT_PUBLIC_NANGO_API_URL);
      console.log(`[Nango] Base URL:`, process.env.NEXT_PUBLIC_NANGO_BASE_URL);

      if (!nango) {
        console.error('[Nango] Cannot connect: missing nango instance');
        console.error('[Nango] Nango instance exists:', !!nango);
        toast({
          title: "Connection Error",
          description: "Unable to initialize connection. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const connectUI = await initializeConnectUI(integration);
      if (!connectUI) {
        console.error('[Nango] Connect UI initialization failed');
        toast({
          title: "Connection Error",
          description: "Failed to initialize connection UI. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const providerId = integration.key;
      console.log(`[Nango] Opening Connect UI for ${providerId}`);

      // Use a small delay to ensure the UI is ready
      setTimeout(() => {
        try {
          console.log(`[Nango] About to call connectUI.open(${providerId})`);
          connectUI.open(providerId);
          console.log(`[Nango] connectUI.open() called successfully`);
        } catch (error) {
          console.error(`[Nango] Error opening Connect UI for ${providerId}:`, error);
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
    }
  };

  const handleRevokeAccess = async (app: Integration) => {
    try {
      setIsRevoking(true);
      // await revokeGoogleDriveAccess();
      const revoke_provider = app.key;
      await revokeAccess(revoke_provider);
      toast({
        title: "Connection revoked",
        description: `${app.title} has been disconnected successfully.`,
      });
      // Invalidate and refetch connections to update UI
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke access. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsRevoking(false);
    }
  }

  const filteredApps = apps
    .sort((a, b) =>
      sort === "ascending"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    )
    .filter((app) =>
      appType === "connected"
        ? app.is_connected
        : appType === "notConnected"
        ? !app.is_connected
        : true
    )
    .filter((app) => app.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <ContentSection
      title="App Integrations"
      desc="Connect and manage integrations for your workspace."
    >
      <div>
        <div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
        <div className="flex flex-col gap-4 sm:my-4 sm:flex-row">
          <Input
            placeholder="Filter apps..."
            className="h-9 w-40 lg:w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={appType} onValueChange={setAppType}>
            <SelectTrigger className="w-36">
              <SelectValue>{appText.get(appType)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apps</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="notConnected">Not Connected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-16">
            <SelectValue>
              <IconAdjustmentsHorizontal size={18} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="ascending">
              <div className="flex items-center gap-4">
                <IconSortAscendingLetters size={16} />
                <span>Ascending</span>
              </div>
            </SelectItem>
            <SelectItem value="descending">
              <div className="flex items-center gap-4">
                <IconSortDescendingLetters size={16} />
                <span>Descending</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator className="shadow" />
      <div className="h-full">
      {integrationsLoading || connectionsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading integrations...</p>
          </div>
        </div>
      ) : integrationsError || connectionsError ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load integrations</p>
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['integrations'] });
                queryClient.invalidateQueries({ queryKey: ['connections'] });
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      ) : apps.length > 0 ? (
        <ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <li
              key={app.title}
              className="rounded-lg border p-4 hover:shadow-md"
            >
              <div className="mb-8 flex items-center justify-between">
                <div
                  className={`flex size-10 items-center justify-center rounded-lg bg-muted p-2`}
                >
                  {app.icon_url && isSafeUrl(app.icon_url) ? (
                    <img src={app.icon_url} alt="App icon" className="h-8 w-8 object-contain" />
                  ) : (
                    <Icons.media className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                {app.is_connected ? (
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" disabled>
                      Connected
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevokeAccess(app)}
                      disabled={isRevoking}
                    >
                      {isRevoking ? "Revoking..." : "Revoke"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(app)}
                  >
                    Connect
                  </Button>
                )}
              </div>
              <div>
                <h2 className="mb-1 font-semibold">{app.title}</h2>
                <p className="line-clamp-2 text-gray-500">{app.description}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={"Apps integration empty"} />
      )}
      </div>
      </div>
    </ContentSection>
  );
}

"use client";
import { useEffect, useState } from "react";
import {
  IconAdjustmentsHorizontal,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import { Layout } from "@/components/custom/layout";
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
import { getIntegrations, NangoConnection, Integration, getNangoSessions, revokeAccess, saveNangoConnection, getConnections } from "@/api/integrations";
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

export default function Apps() {
  const [sort, setSort] = useState("ascending");
  const [appType, setAppType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Integration | null>(null);
  const [nangoSessionToken, setNangoSessionToken] = useState<string | null>(null);
  const [nangoConnect, setNangoConnect] = useState<any>(null);
  const [nango, setNango] = useState<Nango | null>(null);
  const [appIntegration, setIntegration] = useState<Integration | null>(null);
  const { toast } = useToast();

  // Ensure apps is initialized as an empty array
  const [apps, setApps] = useState<Integration[]>([]);
  const [connnects, setConnects] = useState<NangoConnection[]>([]);
  const temp_apps = [
    {
      key: "google_drive",
      title: "Google Drive",
      description: "Google Drive",
      icon_url: "",
      is_connected: false
    },
    {
      key: "google_drive",
      title: "Slack",
      description: "Slack",
      icon_url: "",
      is_connected: true
    }
  ];

  const fetchApps = async () => {
    try {
      const data = await getIntegrations();
      const connects = await getConnections();
      console.log("data", data);
      
      // Process connections to update integration status
      const processedData = data?.map(element => {
        const isConnected = connects?.some(connection => connection.provider === element.key);
        return {
          ...element,
          is_connected: isConnected
        };
      });
      
      console.log("connections", connects);
      setConnects(connects ?? []);
      setApps(processedData ?? []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchApps();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

        const response = await getNangoSessions();

        console.log("res", response);

        if (response && typeof response === 'object' && 'token' in response) {
          const sessionToken = (response as any).token;
          setNangoSessionToken(sessionToken);

          const nangoInstance = new Nango();
          setNango(nangoInstance);

          setNangoSessionToken(sessionToken);
          console.log('[Nango] Session token stored, Connect UI will be initialized on demand');
        } else {
          console.error('[Nango] Failed to get Connect session token:', response);
        }
      } catch (error) {
        console.error('[Nango] Initialization error:', error);
      }
    };
    initNango();
  }, []);

  const initializeConnectUI = (integration: Integration) => {

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
      const connectUI = nango.openConnectUI({
        apiURL: process.env.NEXT_PUBLIC_NANGO_API_URL || "https://nango.opie.sh",
        baseURL: process.env.NEXT_PUBLIC_NANGO_BASE_URL || "https://nango.opie.sh",
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
                        // Refresh the apps list to show updated connection status
                        await fetchApps();
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
      connectUI.setSessionToken(nangoSessionToken);
      setNangoConnect(connectUI);

      return connectUI;
    } catch (error) {
      console.error('[Nango] Error initializing Connect UI:', error);
      return null;
    }
  };

  const handleConnect = async (integration: Integration) => {
    setIntegration(integration);
    try {
      console.log(`[Nango] Attempting to connect to ${integration.title} with provider ID: ${integration.key}`);
      
      if (!nango || !nangoSessionToken) {
        console.error('[Nango] Cannot connect: missing nango instance or session token');
        toast({
          title: "Connection Error",
          description: "Unable to initialize connection. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const connectUI = initializeConnectUI(integration);
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
          connectUI.open(providerId);
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
      // Refresh the app list to show updated connection status
      await fetchApps();
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
    <Layout fixed>
      {/* ===== Top Heading ===== */}

      {/* ===== Content ===== */}
      <Layout.Body className="flex flex-col">
        <div>
          {/* <h1 className="text-2xl font-bold tracking-tight">
            App Integrations
          </h1> */}
          <p className="text-muted-foreground">
            Here&apos;s a list of your apps for the integration!
          </p>
        </div>
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
        {apps ? (
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
      </Layout.Body>
    </Layout>
  );
}

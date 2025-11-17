"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ConnectUI } from '@nangohq/frontend';
import Nango from '@nangohq/frontend';
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
import { Button } from "@/components/custom/button";
import { getIntegrations, Integration, revokeAccess, getConnections, createNangoSession } from "@/api/integrations";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";
import { isSafeUrl } from "@/lib/utils/url";

const appText = new Map<string, string>([
  ["all", "All Apps"],
  ["connected", "Connected"],
  ["notConnected", "Not Connected"],
]);

// Initialize Nango at module level (like sample app)
const apiURL = process.env.NEXT_PUBLIC_NANGO_API_URL ?? 'https://api.nango.dev';
const connectUIBaseUrl = process.env.NEXT_PUBLIC_NANGO_BASE_URL ?? 'https://connect.nango.dev';
const nango = new Nango({ host: apiURL, publicKey: 'empty' });

// Integration item component following sample app pattern
function IntegrationItem({ integration }: { integration: Integration }) {
  const connectUI = useRef<ConnectUI | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleConnect = () => {
    setLoading(true);
    setError(null);

    connectUI.current = nango.openConnectUI({
      apiURL,
      baseURL: connectUIBaseUrl,
      onEvent: (event) => {
        if (event.type === 'close') {
          // Refresh on close so user can see the difference
          void queryClient.refetchQueries({ queryKey: ['connections'] });
          setLoading(false);
        } else if (event.type === 'connect') {
          // Backend will receive webhook with connection info
          void queryClient.refetchQueries({ queryKey: ['connections'] });
          toast({ 
            title: 'Connection Successful', 
            description: `Successfully connected to ${integration.title}` 
          });
        }
      },
    });

    // Defer token creation so iframe can open and display loading screen
    setTimeout(async () => {
      try {
        const token = await createNangoSession(integration.key);
        connectUI.current!.setSessionToken(token);
      } catch (err) {
        console.error('[Nango] Failed to create session:', err);
        setError('Failed to create connection session');
        setLoading(false);
      }
    }, 10);
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);
      await revokeAccess(integration.key);
      
      // Reload connections to update state
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ['connections'] });
        setLoading(false);
        toast({ 
          title: 'Connection revoked', 
          description: `${integration.title} has been disconnected successfully.` 
        });
      }, 10);
    } catch (err) {
      console.error(err);
      setError('Failed to disconnect');
      setLoading(false);
      toast({ 
        title: 'Error', 
        description: 'Failed to revoke access. Please try again.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <li className="rounded-lg border p-4 hover:shadow-md">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted p-2">
          {integration.icon_url && isSafeUrl(integration.icon_url) ? (
            <img src={integration.icon_url} alt="App icon" className="h-8 w-8 object-contain" />
          ) : (
            <Icons.media className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        {error && (
          <div className="text-xs text-red-400 mb-2">{error}</div>
        )}
        {integration.is_connected ? (
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              disabled
              className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 cursor-not-allowed"
              onClick={(e) => e.preventDefault()}
            >
              Connected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              disabled={loading}
            >
              {loading ? "Revoking..." : "Revoke"}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
      <div>
        <h2 className="mb-1 font-semibold">{integration.title}</h2>
      </div>
    </li>
  );
}

export default function IntegrationsSettingsPage() {
  const [sort, setSort] = useState("ascending");
  const [appType, setAppType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // React Query for integrations
  const { data: integrationsData, isLoading: integrationsLoading, error: integrationsError } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => getIntegrations(), 
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // React Query for connections
  const { data: connectionsData, isLoading: connectionsLoading, error: connectionsError } = useQuery({
    queryKey: ['connections'],
    queryFn: () => getConnections(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Memoized processed integrations with connection status
  const apps = useMemo(() => {
    if (!integrationsData || !connectionsData) return [];

    const integrations = Array.isArray(integrationsData) ? integrationsData : (integrationsData as any)?.data || (integrationsData as any)?.results || [];
    const connections = Array.isArray(connectionsData) ? connectionsData : (connectionsData as any)?.data || (connectionsData as any)?.results || [];

    return integrations.map((integration: Integration) => {
      const isConnected = connections?.some((connection: any) => connection.provider === integration.key || (connection as any).provider_config_key === integration.key);
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
        queryClient.refetchQueries({ queryKey: ['integrations'] });
        queryClient.refetchQueries({ queryKey: ['connections'] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  const filteredApps = useMemo(() => {
    return [...apps]
      .sort((a, b) => (sort === "ascending" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)))
      .filter((app: Integration) => (appType === "connected" ? app.is_connected : appType === "notConnected" ? !app.is_connected : true))
      .filter((app: Integration) => app.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [apps, sort, appType, searchTerm]);

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
                queryClient.refetchQueries({ queryKey: ['integrations'] });
                queryClient.refetchQueries({ queryKey: ['connections'] });
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
            <IntegrationItem key={app.key} integration={app} />
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
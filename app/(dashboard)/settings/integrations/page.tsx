"use client";
import { useEffect, useState, useMemo, useRef } from "react";
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
  const [revokingKey, setRevokingKey] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Integration | null>(null);
  const nangoRef = useRef<any>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const connectUIRef = useRef<any>(null);
  const [appIntegration, setIntegration] = useState<Integration | null>(null);
  const { toast } = useToast();
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

  // Lazy-load Nango, create a single page-scoped session, and pre-create Connect UI
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const mod = await import('@nangohq/frontend');
        if (cancelled) return;
        const NangoLib = mod.default;
        nangoRef.current = new NangoLib();

        if (!process.env.NEXT_PUBLIC_NANGO_API_URL || !process.env.NEXT_PUBLIC_NANGO_BASE_URL) {
          console.error('[Nango] Missing NEXT_PUBLIC_NANGO_API_URL or NEXT_PUBLIC_NANGO_BASE_URL');
          return;
        }

        const token = await createNangoSession('connect');
        if (cancelled || !token) return;
        sessionTokenRef.current = token;

        const connectUI = nangoRef.current.openConnectUI({
          apiURL: process.env.NEXT_PUBLIC_NANGO_API_URL,
          baseURL: process.env.NEXT_PUBLIC_NANGO_BASE_URL,
          detectClosedAuthWindow: true,
          onEvent: (event: any) => {
            try {
              if (event.type === 'connect') {
                const payload = event.payload || {};
                const connectionId = payload.connectionId;
                const actualProvider = (payload as any).provider ?? payload.providerConfigKey;
                if (!actualProvider || !connectionId) {
                  toast({ title: 'Connection Error', description: 'Invalid connection data received. Please try again.', variant: 'destructive' });
                  return;
                }
                toast({ title: 'Connection Successful', description: `Successfully connected to ${appIntegration?.title ?? actualProvider}` });
                saveNangoConnection({ provider: actualProvider, connectionId } as any)
                  .catch(() => {})
                  .finally(() => {
                    queryClient.invalidateQueries({ queryKey: ['connections'] });
                  });
              }
            } catch (e) {
              console.error('[Nango] Error handling event:', e);
            }
          },
        });
        connectUI.setSessionToken(token);
        connectUIRef.current = connectUI;
      } catch (error) {
        console.error('[Nango] Initialization error:', error);
      }
    };

    if (typeof window !== 'undefined') {
      const ric = (window as any).requestIdleCallback;
      if (typeof ric === 'function') {
        ric(init, { timeout: 1500 });
      } else {
        setTimeout(init, 300);
      }
    }

    return () => { cancelled = true; };
  }, [toast, queryClient, appIntegration?.title]);


  const ensureConnectUI = async (integration: Integration) => {
    if (connectUIRef.current) return connectUIRef.current;
    try {
      const mod = await import('@nangohq/frontend');
      const NangoLib = mod.default;
      if (!nangoRef.current) nangoRef.current = new NangoLib();
      if (!process.env.NEXT_PUBLIC_NANGO_API_URL || !process.env.NEXT_PUBLIC_NANGO_BASE_URL) {
        toast({ title: 'Configuration Error', description: 'Nango configuration is missing. Please contact support.', variant: 'destructive' });
        return null;
      }
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = await createNangoSession(integration.key);
      }
      const connectUI = nangoRef.current.openConnectUI({
        apiURL: process.env.NEXT_PUBLIC_NANGO_API_URL,
        baseURL: process.env.NEXT_PUBLIC_NANGO_BASE_URL,
        detectClosedAuthWindow: true,
        onEvent: (event: any) => {
          try {
            if (event.type === 'connect') {
              const payload = event.payload || {};
              const connectionId = payload.connectionId;
              const actualProvider = (payload as any).provider ?? payload.providerConfigKey;
              if (!actualProvider || !connectionId) {
                toast({ title: 'Connection Error', description: 'Invalid connection data received. Please try again.', variant: 'destructive' });
                return;
              }
              toast({ title: 'Connection Successful', description: `Successfully connected to ${appIntegration?.title ?? actualProvider}` });
              saveNangoConnection({ provider: actualProvider, connectionId } as any)
                .catch(() => {})
                .finally(() => {
                  queryClient.invalidateQueries({ queryKey: ['connections'] });
                });
            }
          } catch (e) {
            console.error('[Nango] Error handling event:', e);
          }
        },
      });
      connectUI.setSessionToken(sessionTokenRef.current);
      connectUIRef.current = connectUI;
      return connectUI;
    } catch (e) {
      console.error('[Nango] Failed to ensure Connect UI:', e);
      return null;
    }
  };

  const handleConnect = async (integration: Integration) => {
    setIntegration(integration);
    try {
      const connectUI = connectUIRef.current || (await ensureConnectUI(integration));
      if (!connectUI) {
        toast({ title: 'Connection Error', description: 'Failed to initialize connection UI. Please try again.', variant: 'destructive' });
        return;
      }
      connectUI.open(integration.key);
    } catch (err) {
      console.error('Nango connect error:', err);
      toast({ title: 'Connection Error', description: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
    }
  };

  const handleRevokeAccess = async (app: Integration) => {
    setRevokingKey(app.key);
    const prev = queryClient.getQueryData(['connections']);
    queryClient.setQueryData(['connections'], (old: any) => {
      const list = Array.isArray(old) ? old : old?.data || old?.results || [];
      return list.filter((c: any) => c.provider !== app.key && (c as any).provider_config_key !== app.key);
    });
    try {
      await revokeAccess(app.key);
      toast({ title: 'Connection revoked', description: `${app.title} has been disconnected successfully.` });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    } catch (error) {
      queryClient.setQueryData(['connections'], prev);
      toast({ title: 'Error', description: 'Failed to revoke access. Please try again.', variant: 'destructive' });
      console.error(error);
    } finally {
      setRevokingKey(null);
    }
  }

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
                      disabled={revokingKey === app.key}
                    >
                      {revokingKey === app.key ? "Revoking..." : "Revoke"}
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
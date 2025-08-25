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
import { getIntegrations, Integration } from "@/api/integrations";
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
  const { toast } = useToast();

  // Ensure apps is initialized as an empty array
  const [apps, setApps] = useState<Integration[]>([]);

  const fetchApps = async () => {
    try {
      const data = await getIntegrations();
      setApps(data ?? []);
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

  
  const handleRevokeAccess = async (app: Integration) => {
  try {
    setIsRevoking(true);
    await revokeGoogleDriveAccess();
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
                    onClick={() => handleConnectionApp(app)}
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

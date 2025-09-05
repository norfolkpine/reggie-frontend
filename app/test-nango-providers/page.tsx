"use client";
import { useEffect, useState } from "react";
import { getNangoProviders, convertNangoProviderToIntegration, NangoProvider } from "@/api/integrations";
import { Button } from "@/components/custom/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ExternalLink } from "lucide-react";

export default function TestNangoProviders() {
  const [providers, setProviders] = useState<NangoProvider[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching Nango providers...");
      const nangoProviders = await getNangoProviders();
      console.log("Raw Nango providers:", nangoProviders);
      
      setProviders(nangoProviders);
      
      // Convert to integration format
      const convertedIntegrations = nangoProviders.map(convertNangoProviderToIntegration);
      console.log("Converted integrations:", convertedIntegrations);
      
      setIntegrations(convertedIntegrations);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Nango Providers Test Page</h1>
        <p className="text-muted-foreground">
          Test page for fetching and displaying Nango providers directly from the API.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={fetchProviders} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Refresh Providers"
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
        {/* Raw Nango Providers */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Nango Providers ({providers.length})</CardTitle>
            <CardDescription>
              Direct response from Nango API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {providers.length > 0 ? (
              <div className="space-y-4">
                {providers.slice(0, 5).map((provider, index) => (
                  <div key={provider.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{provider.display_name}</h3>
                      <Badge variant="outline">{provider.name}</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Auth Mode:</strong> {provider.auth_mode}</p>
                      <p><strong>Categories:</strong> {provider.categories.join(", ")}</p>
                      {provider.authorization_url && (
                        <p><strong>Auth URL:</strong> 
                          <a 
                            href={provider.authorization_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-600 hover:underline inline-flex items-center"
                          >
                            {provider.authorization_url}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </p>
                      )}
                      {provider.docs && (
                        <p><strong>Docs:</strong> 
                          <a 
                            href={provider.docs} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-600 hover:underline inline-flex items-center"
                          >
                            {provider.docs}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {providers.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    ... and {providers.length - 5} more providers
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No providers loaded</p>
            )}
          </CardContent>
        </Card>

        {/* Converted Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Converted Integrations ({integrations.length})</CardTitle>
            <CardDescription>
              Nango providers converted to Integration format
            </CardDescription>
          </CardHeader>
          <CardContent>
            {integrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.slice(0, 12).map((integration, index) => (
                  <div key={integration.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{integration.title}</h3>
                      <Badge variant="secondary">{integration.key}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {integration.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Connected: {integration.is_connected ? "Yes" : "No"}
                      </span>
                      <Button size="sm" variant="outline">
                        Connect
                      </Button>
                    </div>
                  </div>
                ))}
                {integrations.length > 12 && (
                  <div className="col-span-full text-center text-sm text-muted-foreground">
                    ... and {integrations.length - 12} more integrations
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

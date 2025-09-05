"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/custom/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ExternalLink } from "lucide-react";

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

  useEffect(() => {
    fetchIntegrations();
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
                      <Button size="sm" variant="outline">
                        Connect
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

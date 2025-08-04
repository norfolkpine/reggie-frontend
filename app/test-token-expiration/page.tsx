'use client';

import { useAuth } from '@/contexts/auth-context';
import { triggerTokenExpiration } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestTokenExpirationPage() {
  const { isAuthenticated, user, handleTokenExpiration } = useAuth();

  const handleManualExpiration = () => {
    handleTokenExpiration();
  };

  const handleApiClientExpiration = () => {
    triggerTokenExpiration();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">JWT Token Expiration Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Auth State</CardTitle>
            <CardDescription>Check your current authentication status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              {user && (
                <p><strong>User:</strong> {user.email}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Expiration Tests</CardTitle>
            <CardDescription>Test different token expiration scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleManualExpiration}
              variant="destructive"
              className="w-full"
            >
              Trigger Manual Token Expiration
            </Button>
            
            <Button 
              onClick={handleApiClientExpiration}
              variant="destructive"
              className="w-full"
            >
              Trigger API Client Token Expiration
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Understanding the JWT token expiration flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Automatic Detection</h4>
                <p className="text-sm text-muted-foreground">
                  When any API call returns a 401 status, the system automatically detects token expiration.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. Token Refresh Attempt</h4>
                <p className="text-sm text-muted-foreground">
                  The system first attempts to refresh the token using the refresh token stored in localStorage.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. Automatic Redirect</h4>
                <p className="text-sm text-muted-foreground">
                  If refresh fails or no refresh token is available, the user is automatically redirected to the sign-in page using client-side routing (no page refresh).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">4. State Cleanup</h4>
                <p className="text-sm text-muted-foreground">
                  All authentication data is cleared from localStorage and the auth context is reset.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
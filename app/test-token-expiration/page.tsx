'use client';

import { useAuth } from '@/contexts/auth-context';
import { triggerTokenExpiration } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import { useState } from 'react';

export default function TestTokenExpirationPage() {
  const { isAuthenticated, user, handleTokenExpiration, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleManualExpiration = () => {
    handleTokenExpiration();
  };

  const handleApiClientExpiration = () => {
    triggerTokenExpiration();
  };

  const handleLogout = async () => {
    await logout();
  };

  const test401Response = async () => {
    setIsLoading(true);
    try {
      // This will trigger a 401 response and test the automatic logout/redirect
      await api.get('/api/test-401');
    } catch (error) {
      console.log('Expected 401 error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const test403Response = async () => {
    setIsLoading(true);
    try {
      // This will trigger a 403 response (should not retry infinitely)
      await api.get('/api/test-403');
    } catch (error) {
      console.log('Expected 403 error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const test500Response = async () => {
    setIsLoading(true);
    try {
      // This will trigger a 500 response (should not retry)
      await api.get('/api/test-500');
    } catch (error) {
      console.log('Expected 500 error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Session Authentication Test</h1>
      
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
            <CardTitle>Authentication Tests</CardTitle>
            <CardDescription>Test different authentication scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleManualExpiration}
              variant="outline"
              className="w-full"
            >
              Trigger Manual Session Expiration
            </Button>
            
            <Button 
              onClick={handleApiClientExpiration}
              variant="outline"
              className="w-full"
            >
              Trigger API Client Session Expiration
            </Button>

            <Button 
              onClick={test401Response}
              variant="destructive"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test 401 Response (Auto Logout)'}
            </Button>

            <Button 
              onClick={test403Response}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test 403 Response'}
            </Button>

            <Button 
              onClick={test500Response}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test 500 Response'}
            </Button>

            <Button 
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              Manual Logout
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Understanding the session-based authentication flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Automatic 401 Detection</h4>
                <p className="text-sm text-muted-foreground">
                  When any API call returns a 401 status, the system automatically detects session expiration.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. Immediate Logout</h4>
                <p className="text-sm text-muted-foreground">
                  The system immediately calls logout() which clears all user data, query cache, and localStorage.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. Automatic Redirect</h4>
                <p className="text-sm text-muted-foreground">
                  After logout, the user is automatically redirected to the sign-in page using Next.js router.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">4. Session Cookie Cleanup</h4>
                <p className="text-sm text-muted-foreground">
                  The logout API call also clears the session cookie on the server side for complete cleanup.
                </p>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <h4 className="font-semibold mb-2 text-yellow-800">⚠️ Error Response Testing</h4>
                <p className="text-sm text-yellow-700">
                  The test buttons will make requests to non-existent endpoints to test different error scenarios:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                  <li><strong>401 Response:</strong> Should trigger automatic logout and redirect</li>
                  <li><strong>403 Response:</strong> Should be handled normally (no retry)</li>
                  <li><strong>500 Response:</strong> Should be handled normally (no retry)</li>
                </ul>
                <p className="text-sm text-yellow-700 mt-2">
                  Check the browser console for detailed logs showing request attempts and error handling.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { getDevProxyStatus, shouldUseDevProxy } from '@/config/dev-proxy.config';
import { getProxyStatus, getProxiedUrl, proxiedFetch } from '@/lib/dev-proxy';

export default function DevProxyTestPage() {
  const [proxyStatus, setProxyStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get proxy status on component mount
    setProxyStatus({
      config: getDevProxyStatus(),
      runtime: getProxyStatus(),
    });
  }, []);

  const testProxy = async () => {
    setIsLoading(true);
    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
    };

    try {
      // Test 1: Check if proxy is enabled
      const status = getProxyStatus();
      results.tests.push({
        name: 'Proxy Status Check',
        success: status.isEnabled,
        details: status,
      });

      // Test 2: Test URL conversion
      const testUrl = 'https://api.opie.sh/test-endpoint';
      const shouldProxy = shouldUseDevProxy(testUrl);
      const proxiedUrl = getProxiedUrl(testUrl);
      results.tests.push({
        name: 'URL Proxy Detection',
        success: shouldProxy,
        details: { originalUrl: testUrl, shouldProxy, proxiedUrl },
      });

      // Test 3: Test actual proxy request (if enabled)
      if (status.isEnabled) {
        try {
          const response = await fetch('/api/dev-proxy/api/test-endpoint');
          results.tests.push({
            name: 'Proxy Request Test',
            success: response.status !== 500,
            details: { status: response.status, statusText: response.statusText },
          });
        } catch (error) {
          results.tests.push({
            name: 'Proxy Request Test',
            success: false,
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          });
        }
      }

      // Test 4: Test proxiedFetch function
      if (status.isEnabled) {
        try {
          // This should use the proxiedFetch function
          const response = await proxiedFetch('https://api.opie.sh/test-endpoint');
          results.tests.push({
            name: 'ProxiedFetch Function Test',
            success: true,
            details: { message: 'ProxiedFetch function works correctly' },
          });
        } catch (error) {
          results.tests.push({
            name: 'ProxiedFetch Function Test',
            success: false,
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          });
        }
      }

    } catch (error) {
      results.tests.push({
        name: 'Test Execution',
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600">Development Only</h1>
        <p>This page is only available in development mode.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Dev Proxy Test Page</h1>
      
      {/* Proxy Status */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Proxy Status</h2>
        <pre className="bg-white p-4 rounded border overflow-auto">
          {JSON.stringify(proxyStatus, null, 2)}
        </pre>
      </div>

      {/* Test Controls */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <button
          onClick={testProxy}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          {isLoading ? 'Running Tests...' : 'Run Proxy Tests'}
        </button>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            {testResults.tests.map((test: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded border ${
                  test.success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                }`}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  {test.success ? '✅' : '❌'} {test.name}
                </h3>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600">View Details</summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <strong>Timestamp:</strong> {testResults.timestamp}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-yellow-50 p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
        <div className="space-y-2 text-sm">
          <p><strong>1.</strong> Use <code>proxiedFetch()</code> function for .opie.sh requests</p>
          <p><strong>2.</strong> Or manually convert URLs with <code>getProxiedUrl()</code></p>
          <p><strong>3.</strong> Cookies and CSRF tokens are automatically handled</p>
          <p><strong>4.</strong> The proxy only runs in development mode</p>
          <p><strong>5.</strong> You can configure the proxy in <code>config/dev-proxy.config.ts</code></p>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-gray-50 p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Using proxiedFetch:</h3>
            <pre className="bg-white p-3 rounded border text-sm overflow-auto">
{`import { proxiedFetch } from '@/lib/dev-proxy';

// This automatically uses the proxy in development
const response = await proxiedFetch('https://api.opie.sh/users');`}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Manual URL conversion:</h3>
            <pre className="bg-white p-3 rounded border text-sm overflow-auto">
{`import { getProxiedUrl } from '@/lib/dev-proxy';

const originalUrl = 'https://api.opie.sh/users';
const proxiedUrl = getProxiedUrl(originalUrl);
const response = await fetch(proxiedUrl);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

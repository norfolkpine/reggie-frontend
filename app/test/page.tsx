"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

export default function TestPage() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testExternalError = () => {
    try {
      // Simulate a MetaMask connection error (like the real issue)
      const metamaskError = new Error("Failed to connect to MetaMask");
      metamaskError.name = "MetaMaskError";
      metamaskError.stack = `Error: Failed to connect to MetaMask
        at chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/background.js:1:1
        at chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/content-script.js:45:23
        at eval (eval at <anonymous>, <anonymous>:1:1)`;
      throw metamaskError;
    } catch (error) {
      addResult("Testing MetaMask error (should be filtered out)");
      Sentry.captureException(error);
    }
  };

  const testAppError = () => {
    try {
      // Simulate a legitimate application error with app paths
      const appError = new Error("Application feature not working");
      appError.name = "ApplicationError";
      // Add app-specific stack trace
      appError.stack = `Error: Application feature not working
        at app/test/page.tsx:45:15
        at components/ui/button.tsx:23:8
        at _next/static/chunks/app.js:123:45`;
      throw appError;
    } catch (error) {
      addResult("Testing app error (should be sent to Sentry)");
      Sentry.captureException(error);
    }
  };

  const testNextJsError = () => {
    try {
      // Simulate a Next.js specific error
      const nextError = new Error("Next.js routing error");
      nextError.name = "NextJSError";
      // Add Next.js specific stack trace
      nextError.stack = `Error: Next.js routing error
        at _next/static/chunks/pages/_app.js:67:12
        at webpack:///./pages/_app.tsx:34:8
        at app/layout.tsx:23:15`;
      throw nextError;
    } catch (error) {
      addResult("Testing Next.js error (should be sent to Sentry)");
      Sentry.captureException(error);
    }
  };

  const testLocalhostError = () => {
    try {
      // Simulate an error from localhost origin
      const localhostError = new Error("Localhost error");
      localhostError.name = "LocalhostError";
      // Add localhost stack trace
      localhostError.stack = `Error: Localhost error
        at http://localhost:3000/app/test/page.tsx:67:12
        at http://localhost:3000/_next/static/chunks/app.js:89:34`;
      throw localhostError;
    } catch (error) {
      addResult("Testing localhost error (should be sent to Sentry)");
      Sentry.captureException(error);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Browser Extension Error Filtering Test</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          This page tests the browser extension error filtering in Sentry. 
          Errors from browser extensions will be filtered out and not sent to Sentry.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={testExternalError}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Test MetaMask Error (Filtered)
          </button>
          
          <button
            onClick={testAppError}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test App Error (Sent to Sentry)
          </button>
          
          <button
            onClick={testNextJsError}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Next.js Error (Sent to Sentry)
          </button>
          
          <button
            onClick={testLocalhostError}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Localhost Error (Sent to Sentry)
          </button>
        </div>
        
        <button
          onClick={clearResults}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        {results.length === 0 ? (
          <p className="text-gray-500">No tests run yet. Click the buttons above to test error filtering.</p>
        ) : (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded border border-yellow-200">
        <h3 className="text-lg font-semibold mb-2">How to Verify</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open your browser's developer console (F12)</li>
          <li>Click the test buttons above</li>
          <li>Check the console for "Filtered out extension error" messages</li>
          <li>Check your Sentry dashboard - only legitimate app errors should appear</li>
          <li>Extension errors will show in console but not in Sentry</li>
        </ol>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded border border-blue-200">
        <h3 className="text-lg font-semibold mb-2">How It Works</h3>
        <p className="text-sm text-gray-700">
          The filter uses Sentry's event structure to identify extension errors:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
          <li>Checks request URLs for extension protocols (chrome-extension://, moz-extension://, etc.)</li>
          <li>Analyzes stack trace frames for extension file paths</li>
          <li>Filters out content scripts, background scripts, and extension manifests</li>
          <li>Allows legitimate application errors to be sent to Sentry</li>
        </ul>
      </div>
    </div>
  );
}


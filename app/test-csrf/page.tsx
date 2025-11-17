'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getCSRFToken } from '@/api/utils'
import { ensureCSRFToken } from '@/lib/api-client'
import { login } from '@/api/auth'

export default function TestCSRFPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('admin@mail.com')
  const [password, setPassword] = useState('admin123')

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`
    setLogs(prev => [...prev, logMessage])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testCSRFToken = async () => {
    setIsLoading(true)
    clearLogs()
    
    try {
      addLog('🔍 Starting CSRF token test...', 'info')
      
      // Step 1: Check current cookies
      addLog('Step 1: Checking current cookies', 'info')
      addLog(`Current cookies: ${document.cookie}`, 'info')
      
      // Step 2: Try to get existing CSRF token
      addLog('Step 2: Checking for existing CSRF token', 'info')
      let csrfToken = getCSRFToken()
      if (csrfToken) {
        addLog(`✅ Found existing CSRF token: ${csrfToken.substring(0, 10)}...`, 'success')
      } else {
        addLog('❌ No existing CSRF token found', 'error')
      }
      
      // Step 3: Try to ensure CSRF token
      addLog('Step 3: Attempting to ensure CSRF token', 'info')
      const tokenEnsured = await ensureCSRFToken()
      if (tokenEnsured) {
        addLog('✅ CSRF token ensured successfully', 'success')
        csrfToken = getCSRFToken()
        if (csrfToken) {
          addLog(`New CSRF token: ${csrfToken.substring(0, 10)}...`, 'info')
        }
      } else {
        addLog('❌ Failed to ensure CSRF token', 'error')
      }
      
      // Step 4: Test manual fetch to allauth config
      addLog('Step 4: Testing manual fetch to allauth config', 'info')
      try {
        const response = await fetch('http://127.0.0.1:8000/_allauth/browser/v1/config', {
          method: 'GET',
          credentials: 'include'
        })
        addLog(`Config endpoint response: ${response.status} ${response.statusText}`, response.ok ? 'success' : 'error')
        
        if (response.ok) {
          const data = await response.json()
          addLog(`Config data: ${JSON.stringify(data, null, 2)}`, 'info')
        }
        
        // Check cookies again after config request
        addLog(`Cookies after config request: ${document.cookie}`, 'info')
        csrfToken = getCSRFToken()
        if (csrfToken) {
          addLog(`✅ CSRF token after config: ${csrfToken.substring(0, 10)}...`, 'success')
        }
      } catch (error) {
        addLog(`Config endpoint error: ${error}`, 'error')
      }
      
    } catch (error) {
      addLog(`Test failed: ${error}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const testLogin = async () => {
    setIsLoading(true)
    addLog('🔐 Testing login with current credentials...', 'info')
    
    try {
      const response = await login({ email, password })
      addLog('✅ Login successful!', 'success')
      addLog(`Response: ${JSON.stringify(response, null, 2)}`, 'info')
    } catch (error: any) {
      addLog('❌ Login failed', 'error')
      addLog(`Error: ${JSON.stringify(error, null, 2)}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const testManualLogin = async () => {
    setIsLoading(true)
    addLog('🔐 Testing manual login with CSRF token...', 'info')
    
    try {
      // Get CSRF token
      const csrfToken = getCSRFToken()
      if (!csrfToken) {
        addLog('❌ No CSRF token available for manual login', 'error')
        return
      }
      
      addLog(`Using CSRF token: ${csrfToken.substring(0, 10)}...`, 'info')
      
      const response = await fetch('http://127.0.0.1:8000/_allauth/browser/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      
      addLog(`Manual login response: ${response.status} ${response.statusText}`, response.ok ? 'success' : 'error')
      
      if (response.ok) {
        const data = await response.json()
        addLog(`✅ Manual login successful: ${JSON.stringify(data, null, 2)}`, 'success')
      } else {
        const errorText = await response.text()
        addLog(`❌ Manual login failed: ${errorText}`, 'error')
      }
      
    } catch (error) {
      addLog(`Manual login error: ${error}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>CSRF Token Debug Tool</CardTitle>
          <CardDescription>
            This tool helps debug CSRF token issues with Django allauth login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mail.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testCSRFToken} 
              disabled={isLoading}
              variant="outline"
            >
              Test CSRF Token
            </Button>
            <Button 
              onClick={testLogin} 
              disabled={isLoading}
              variant="default"
            >
              Test Login (API)
            </Button>
            <Button 
              onClick={testManualLogin} 
              disabled={isLoading}
              variant="secondary"
            >
              Test Manual Login
            </Button>
            <Button 
              onClick={clearLogs} 
              disabled={isLoading}
              variant="ghost"
            >
              Clear Logs
            </Button>
          </div>
          
          {logs.length > 0 && (
            <Alert>
              <AlertDescription>
                <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {logs.join('\n')}
                  </pre>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
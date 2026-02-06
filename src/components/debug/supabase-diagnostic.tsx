import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export function SupabaseDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [envInfo, setEnvInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check environment variables (without exposing sensitive data)
    setEnvInfo({
      'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      'VITE_SUPABASE_SERVICE_ROLE_KEY': import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
      'Current URL': window.location.origin,
      'User Agent': navigator.userAgent,
    });
  }, []);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);

    const addResult = (test: string, status: 'success' | 'error', message: string, details?: any) => {
      setResults(prev => [...prev, { test, status, message, details }]);
    };

    // Test 1: Environment Variables
    addResult('Environment Check', 
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? 'success' : 'error',
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY 
        ? 'Required environment variables are present' 
        : 'Missing required environment variables'
    );

    // Test 2: Basic Connection
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        }
      });
      if (response.ok) {
        addResult('Basic Connection', 'success', 'Successfully connected to Supabase REST API');
      } else {
        addResult('Basic Connection', 'error', `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      addResult('Basic Connection', 'error', `Network error: ${error}`, error);
    }

    // Test 3: Auth Session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        addResult('Auth Session', 'error', `Failed to get session: ${error.message}`, error);
      } else {
        addResult('Auth Session', 'success', session ? `User authenticated: ${session.user.email}` : 'No active session');
      }
    } catch (error) {
      addResult('Auth Session', 'error', `Auth error: ${error}`, error);
    }

    // Test 4: Network Connectivity
    try {
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL!, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      });
      addResult('Network Reachability', 'success', 'Supabase URL is reachable');
    } catch (error) {
      addResult('Network Reachability', 'error', `Cannot reach Supabase URL: ${error}`, error);
    }

    // Test 5: CORS and Headers
    try {
      const testUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`;
      const response = await fetch(testUrl, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'apikey, authorization',
        },
      });
      addResult('CORS Check', 'success', `CORS response: ${response.status}`);
    } catch (error) {
      addResult('CORS Check', 'error', `CORS issue: ${error}`, error);
    }

    // Test 6: Database Tables (simple test)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist')) {
          addResult('Database Access', 'success', 'Connected but tables not created yet');
        } else {
          addResult('Database Access', 'error', `Cannot access transactions table: ${error.message}`, error);
        }
      } else {
        addResult('Database Access', 'success', 'Successfully accessed database tables');
      }
    } catch (error) {
      addResult('Database Access', 'error', `Database access error: ${error}`, error);
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Supabase Diagnostic Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment Info */}
          <div>
            <h3 className="font-semibold mb-2">Environment Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {Object.entries(envInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={runDiagnostic} disabled={isRunning} className="flex items-center gap-2">
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin" />
                  Running Diagnostic...
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Run Diagnostic
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Diagnostic Results</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      result.status === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : result.status === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {result.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      {result.status === 'error' && <X className="w-4 h-4 text-red-600" />}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <p className="text-sm text-gray-700">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">View Details</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Troubleshooting Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Common Issues & Solutions</h3>
            <ul className="text-sm space-y-1">
              <li>• <strong>Failed to fetch:</strong> Check internet connection and Supabase URL</li>
              <li>• <strong>CORS errors:</strong> Ensure your domain is in Supabase CORS settings</li>
              <li>• <strong>Missing tables:</strong> Run database migrations in Supabase</li>
              <li>• <strong>Auth issues:</strong> Check JWT configuration and service role keys</li>
              <li>• <strong>Network timeout:</strong> Check firewall/proxy settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
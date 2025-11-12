'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function AppTest() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    console.log('AppTest mounted');
    console.log('Auth state:', { user: !!user, loading });
  }, [user, loading]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Mounting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>App Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>App Status:</strong> Working ✅</p>
            <p><strong>React Status:</strong> Working ✅</p>
            <p><strong>Auth Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? 'Logged In' : 'Not Logged In'}</p>
            <p><strong>Mounted:</strong> {mounted ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Environment:</h3>
            <p className="text-sm">
              <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}
            </p>
            <p className="text-sm">
              <strong>App URL:</strong> {import.meta.env.VITE_APP_URL || 'Not Set'}
            </p>
          </div>
          <Button 
            onClick={() => console.log('Button clicked!')}
            className="w-full"
          >
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

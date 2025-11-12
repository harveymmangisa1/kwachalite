'use client';

import { useBusinessProfile } from '@/hooks/use-business-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/ui/loading';
import { useAuth } from '@/hooks/use-auth';

export function BusinessProfileTest() {
  const { user, loading: authLoading } = useAuth();
  const { 
    businessProfile, 
    isLoading, 
    error, 
    getDisplayName,
    refreshProfile,
    hasProfile 
  } = useBusinessProfile();

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Business Profile Test</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading business profile..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Business Profile Test</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState error={error} onRetry={refreshProfile} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Business Profile Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>User ID:</strong> {user?.id || 'Not logged in'}
          </div>
          <div>
            <strong>Has Profile:</strong> {hasProfile ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Display Name:</strong> {getDisplayName()}
          </div>
          <div>
            <strong>Profile Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
        </div>
        
        {businessProfile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Business Profile Data:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(businessProfile, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-4">
          <Button onClick={refreshProfile} variant="outline">
            Refresh Profile
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p><strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
          <p><strong>Profile Error:</strong> {error || 'None'}</p>
          <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

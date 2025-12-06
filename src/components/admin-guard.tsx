'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Shield, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Simple password check (in production, use proper auth)
  const ADMIN_PASSWORD = 'kwachalite_admin_2024';

  useEffect(() => {
    // Check if user is already authorized (from session storage)
    const authorized = sessionStorage.getItem('admin_authorized');
    if (authorized === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const handleAuthorize = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (password === ADMIN_PASSWORD) {
        setIsAuthorized(true);
        sessionStorage.setItem('admin_authorized', 'true');
      } else {
        setError('Invalid password');
      }
    } catch (error) {
      setError('Authorization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    sessionStorage.removeItem('admin_authorized');
    setPassword('');
    navigate('/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-900">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              You must be logged in to access the admin dashboard.
            </p>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full mt-4"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              This area is restricted to administrators. Please enter the admin password to continue.
            </p>
            
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuthorize()}
              />
              
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <Button 
                onClick={handleAuthorize} 
                className="w-full"
                disabled={loading || !password}
              >
                {loading ? 'Authorizing...' : 'Access Admin Dashboard'}
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                For demo purposes, use: <code className="bg-gray-100 px-2 py-1 rounded">kwachalite_admin_2024</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <span className="text-xs bg-green-600 px-2 py-1 rounded-full">Authorized</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">
              Logged in as: {user.email}
            </span>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="text-white border-white hover:bg-white hover:text-gray-900"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Admin Content */}
      <div className="bg-gray-50 min-h-screen">
        {children}
      </div>
    </div>
  );
}

'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { BusinessProfileSettings } from '@/components/settings/business-profile-settings';
import { SupabaseTest } from '@/components/debug/supabase-test';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/hooks/use-onboarding';
import { supabase } from '@/lib/supabase';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, DollarSign } from 'lucide-react';

export default function SettingsPage() {
  const { activeWorkspace } = useActiveWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const { resetOnboarding, isOnboardingCompleted } = useOnboarding();

  const userInitials = user?.user_metadata?.name || user?.user_metadata?.full_name
    ? (user.user_metadata.name || user.user_metadata.full_name).split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'U';
  
  const userEmail = user?.email || '';

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    
    const formData = new FormData(event.currentTarget);
    const profileData = {
        name: formData.get('name') as string,
        bio: formData.get('bio') as string,
    };
    
    try {
        const { error } = await (supabase as any)
          .from('users')
          .update(profileData)
          .eq('id', user.id);
        
        if (error) {
          throw error;
        }
        
        toast({ title: 'Profile updated!'});
    } catch(e) {
        console.error('Error updating profile:', e);
        toast({ title: 'Error updating profile', variant: 'destructive'});
    }
  }

  const handleResetOnboarding = () => {
    resetOnboarding();
    toast({ 
      title: 'Onboarding reset', 
      description: 'You will see the getting started flow next time you visit the dashboard.' 
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Settings"
        description="Manage your account and application settings."
      />
      <div className="grid gap-8">
        {activeWorkspace === 'personal' ? (
          <Card className="max-w-2xl">
            <form onSubmit={handleUpdateUser}>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal information and profile picture.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.user_metadata?.avatar_url || `https://placehold.co/100x100.png?text=${userInitials}`} alt={user.user_metadata?.name || user.user_metadata?.full_name || 'User'} data-ai-hint="person avatar" />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-2">
                            <Label htmlFor="picture">Profile Picture</Label>
                            <Input id="picture" type="file" className="text-sm" />
                            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                        </div>
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" defaultValue={user.user_metadata?.name || user.user_metadata?.full_name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={userEmail} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" name="bio" defaultValue="I'm a software engineer and I love personal finance." />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <BusinessProfileSettings />
        )}
        
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency Settings
            </CardTitle>
            <CardDescription>
              Choose your preferred currency for displaying monetary values throughout the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900">Display Currency</h4>
                  <p className="text-sm text-slate-600">
                    This currency will be used for all monetary displays and inputs
                  </p>
                </div>
                <CurrencySelector />
              </div>
              <div className="flex items-center justify-between p-4 border-t">
                <div>
                  <h4 className="font-medium text-slate-900">Advanced Currency Options</h4>
                  <p className="text-sm text-slate-600">
                    Access more currency settings and configuration options
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/dashboard/settings/currency">
                    Advanced Settings
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Onboarding</CardTitle>
            <CardDescription>
              Reset your onboarding experience to see the getting started flow again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Getting Started Flow</h4>
                <p className="text-sm text-slate-600">
                  Status: {isOnboardingCompleted ? 'Completed' : 'Not completed'}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleResetOnboarding}
                className="gap-2"
                disabled={!isOnboardingCompleted}
              >
                <RotateCcw className="w-4 h-4" />
                Reset Onboarding
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

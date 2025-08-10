
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
import { useAuth } from '@/hooks/use-auth';

export default function SettingsPage() {
  const { activeWorkspace } = useActiveWorkspace();
  const { userName } = useAuth();

  const userInitials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';
  
  const userEmail = userName ? `${userName.split(' ')[0].toLowerCase()}@example.com` : '';

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Settings"
        description="Manage your account and application settings."
      />
      <div className="px-4 sm:px-6">
        {activeWorkspace === 'personal' ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information and profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                  <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                          <AvatarImage src={`https://placehold.co/100x100.png?text=${userInitials}`} alt={userName || 'User'} data-ai-hint="person avatar" />
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
                  <Input id="name" defaultValue={userName || ''} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={userName?.split(' ')[0].toLowerCase() || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={userEmail} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" defaultValue="I'm a software engineer and I love personal finance." />
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        ) : (
          <BusinessProfileSettings />
        )}
      </div>
    </div>
  );
}

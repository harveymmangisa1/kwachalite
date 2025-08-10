
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
import { updateUserProfile } from '@/app/actions';

export default function SettingsPage() {
  const { activeWorkspace } = useActiveWorkspace();
  const { user } = useAuth();

  const userInitials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';
  
  const userEmail = user?.email || '';

  if (!user) {
    return <div>Loading...</div>;
  }

  const updateUserProfileAction = updateUserProfile.bind(null, user.uid);

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Settings"
        description="Manage your account and application settings."
      />
      <div className="px-4 sm:px-6">
        {activeWorkspace === 'personal' ? (
          <Card className="max-w-2xl mx-auto">
            <form action={updateUserProfileAction}>
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
                            <AvatarImage src={user.photoURL || `https://placehold.co/100x100.png?text=${userInitials}`} alt={user.displayName || 'User'} data-ai-hint="person avatar" />
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
                    <Input id="name" name="name" defaultValue={user.displayName || ''} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" defaultValue={user.email?.split('@')[0] || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={userEmail} />
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
      </div>
    </div>
  );
}

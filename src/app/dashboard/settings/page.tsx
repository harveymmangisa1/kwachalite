import { PageHeader } from '@/components/page-header';
import { CategoryManager } from '@/components/settings/category-manager';
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

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Settings"
        description="Manage your account and application settings."
      />
      <div className="grid gap-6 lg:grid-cols-2 px-4 sm:px-6">
        <Card>
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
                        <AvatarImage src="https://placehold.co/100x100.png" alt="@johndoe" data-ai-hint="person avatar" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-2">
                        <Label htmlFor="picture">Profile Picture</Label>
                        <Input id="picture" type="file" className="text-sm" />
                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="johndoe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
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
        <CategoryManager />
      </div>
    </div>
  );
}

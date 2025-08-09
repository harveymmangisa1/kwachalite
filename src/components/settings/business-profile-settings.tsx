
'use client';

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

export function BusinessProfileSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>
          Update your business information and logo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="Business Logo" data-ai-hint="company logo" />
                    <AvatarFallback>LOGO</AvatarFallback>
                </Avatar>
                <div className="grid gap-2">
                    <Label htmlFor="logo">Business Logo</Label>
                    <Input id="logo" type="file" className="text-sm" />
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                </div>
            </div>
          <div className="space-y-2">
            <Label htmlFor="business-name">Business Name</Label>
            <Input id="business-name" defaultValue="My Business Inc." />
          </div>
           <div className="space-y-2">
            <Label htmlFor="business-email">Contact Email</Label>
            <Input id="business-email" type="email" defaultValue="contact@mybusiness.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-phone">Phone Number</Label>
            <Input id="business-phone" type="tel" defaultValue="+1 234 567 890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-address">Address</Label>
            <Textarea id="business-address" defaultValue="123 Business Rd, Commerce City, 12345" />
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}

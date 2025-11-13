'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AsyncButton } from '@/components/ui/async-button';
import { LoadingState, ErrorState } from '@/components/ui/loading';
import { useFormSubmission } from '@/hooks/use-async-operation';
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
import { useAuth } from '@/hooks/use-auth';
import { useBusinessProfile, type BusinessProfile } from '@/hooks/use-business-profile-v2';
import { useToast } from '@/hooks/use-toast';
import { SyncStatus } from '@/components/sync-status';

export function BusinessProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    businessProfile: hookProfile, 
    isLoading: isLoadingProfile, 
    error: profileError,
    updateBusinessProfile: hookUpdateProfile,
    refreshProfile 
  } = useBusinessProfile();
  
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo_url: '',
    website: '',
    taxId: '',
    registrationNumber: '',
    termsAndConditions: '',
    paymentDetails: '',
    bankDetails: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
  });

  // Load business profile data from hook
  useEffect(() => {
    if (hookProfile) {
      setBusinessProfile(hookProfile);
    }
  }, [hookProfile]);

  // Create async operation for saving business profile
  const { execute: saveBusinessProfile, isLoading: isSaving, error: saveError } = useFormSubmission(
    async () => {
      // Validate required fields
      if (!businessProfile.name.trim()) {
        throw new Error('Business name is required');
      }
      
      await hookUpdateProfile(businessProfile);
    },
    {
      successMessage: 'Business profile updated successfully!',
      showErrorToast: false, // We'll handle errors in the UI
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveBusinessProfile();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    let key = id.replace('business-', '');
    
    // Handle camelCase conversion for specific fields
    const fieldMap: { [key: string]: keyof BusinessProfile } = {
      'name': 'name',
      'email': 'email',
      'phone': 'phone',
      'address': 'address',
      'website': 'website',
      'taxid': 'taxId',
      'regnum': 'registrationNumber',
      'bankname': 'bankName',
      'accountname': 'accountName',
      'accountnumber': 'accountNumber',
      'routingnumber': 'routingNumber',
      'swiftcode': 'swiftCode'
    };
    
    const mappedKey = fieldMap[key] || key;
    
    setBusinessProfile(prev => ({
      ...prev,
      [mappedKey]: value
    }));
  };

  // Get initials for avatar fallback
  const businessInitials = businessProfile.name
    ? businessProfile.name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'BIZ';

  if (isLoadingProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>
            Update your business information and logo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading business profile..." />
        </CardContent>
      </Card>
    );
  }

  if (profileError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>
            Update your business information and logo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorState error={profileError} onRetry={refreshProfile} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>
              Update your business information and logo.
            </CardDescription>
          </div>
          <SyncStatus />
        </div>
      </CardHeader>
      <CardContent>
        {saveError && (
          <div className="mb-4">
            <ErrorState error={saveError} />
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={businessProfile.logo_url || "https://placehold.co/100x100.png?text=" + businessInitials} 
                      alt="Business Logo" 
                      data-ai-hint="company logo" 
                    />
                    <AvatarFallback>{businessInitials}</AvatarFallback>
                </Avatar>
                <div className="grid gap-2">
                    <Label htmlFor="logo">Business Logo</Label>
                    <Input id="logo" type="file" className="text-sm" />
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                </div>
            </div>
          <div className="space-y-2">
            <Label htmlFor="business-name">Business Name</Label>
            <Input 
              id="business-name" 
              value={businessProfile.name} 
              onChange={handleInputChange}
              required
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="business-email">Contact Email</Label>
            <Input 
              id="business-email" 
              type="email" 
              value={businessProfile.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-phone">Phone Number</Label>
            <Input 
              id="business-phone" 
              type="tel" 
              value={businessProfile.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-address">Address</Label>
            <Textarea 
              id="business-address" 
              value={businessProfile.address}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="business-website">Website</Label>
            <Input 
              id="business-website" 
              type="url" 
              value={businessProfile.website || ''}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-taxid">Tax ID</Label>
              <Input 
                id="business-taxid" 
                value={businessProfile.taxId || ''}
                onChange={handleInputChange}
                placeholder="Tax identification number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-regnum">Registration Number</Label>
              <Input 
                id="business-regnum" 
                value={businessProfile.registrationNumber || ''}
                onChange={handleInputChange}
                placeholder="Business registration number"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Banking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-bankname">Bank Name</Label>
                <Input 
                  id="business-bankname" 
                  value={businessProfile.bankName || ''}
                  onChange={handleInputChange}
                  placeholder="Your bank name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-accountname">Account Name</Label>
                <Input 
                  id="business-accountname" 
                  value={businessProfile.accountName || ''}
                  onChange={handleInputChange}
                  placeholder="Account holder name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-accountnumber">Account Number</Label>
                <Input 
                  id="business-accountnumber" 
                  value={businessProfile.accountNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Bank account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-routingnumber">Routing Number</Label>
                <Input 
                  id="business-routingnumber" 
                  value={businessProfile.routingNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Bank routing number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-swiftcode">SWIFT Code (Optional)</Label>
              <Input 
                id="business-swiftcode" 
                value={businessProfile.swiftCode || ''}
                onChange={handleInputChange}
                placeholder="International SWIFT code"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <AsyncButton 
              type="submit" 
              loading={isSaving}
              loadingText="Saving..."
              disabled={isLoadingProfile}
            >
              Save Changes
            </AsyncButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

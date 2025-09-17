import React from 'react';
import Logo from '@/components/logo';
import { useBusinessProfile } from '@/hooks/use-business-profile';
import { LoadingSpinner } from '@/components/ui/loading';

interface BusinessHeaderProps {
  fallbackName?: string;
  fallbackAddress?: string;
  fallbackEmail?: string;
}

export function BusinessHeader({ 
  fallbackName = "My Business Inc.", 
  fallbackAddress = "123 Business Rd, Commerce City, 12345",
  fallbackEmail = "contact@mybusiness.com"
}: BusinessHeaderProps) {
  const { businessProfile, isLoading } = useBusinessProfile();

  if (isLoading) {
    return (
      <div className="flex items-center">
        <LoadingSpinner size="sm" className="mr-2" />
        <span className="text-sm text-muted-foreground">Loading business info...</span>
      </div>
    );
  }

  const displayName = businessProfile?.name || fallbackName;
  const displayAddress = businessProfile?.address || fallbackAddress;
  const displayEmail = businessProfile?.email || fallbackEmail;
  const displayPhone = businessProfile?.phone;
  const displayWebsite = businessProfile?.website;

  return (
    <div>
      <Logo />
      <div className="text-muted-foreground text-sm mt-2">
        <div className="font-semibold text-foreground">{displayName}</div>
        {displayAddress && (
          <div className="mt-1">{displayAddress}</div>
        )}
        <div className="flex flex-col gap-1 mt-1">
          {displayEmail && <div>Email: {displayEmail}</div>}
          {displayPhone && <div>Phone: {displayPhone}</div>}
          {displayWebsite && <div>Web: {displayWebsite}</div>}
          {businessProfile?.taxId && (
            <div>Tax ID: {businessProfile.taxId}</div>
          )}
          {businessProfile?.registrationNumber && (
            <div>Reg. No: {businessProfile.registrationNumber}</div>
          )}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import Logo from '@/components/logo';
import { useBusinessProfile } from '@/hooks/use-business-profile';
import { LoadingSpinner } from '@/components/ui/loading';

interface BusinessHeaderProps {
  fallbackName?: string;
  fallbackAddress?: string;
  fallbackEmail?: string;
  compact?: boolean; // New prop for documents
}

export function BusinessHeader({ 
  fallbackName = "My Business Inc.", 
  fallbackAddress = "123 Business Rd, Commerce City, 12345",
  fallbackEmail = "contact@mybusiness.com",
  compact = false
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
    <div className={compact ? "flex items-start gap-3" : ""}>
      <Logo 
        size={compact ? "sm" : "md"} 
        logoUrl={businessProfile?.logo_url}
        fallbackText={displayName}
        showText={!compact}
        className={compact ? "mt-1" : ""}
      />
      <div className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"} ${compact ? "" : "mt-2"}`}>
        <div className={`font-semibold text-foreground ${compact ? "text-sm" : ""}`}>
          {compact ? displayName : ""}
        </div>
        {!compact && displayAddress && (
          <div className="mt-1">{displayAddress}</div>
        )}
        <div className={`flex flex-col ${compact ? "gap-0.5" : "gap-1"} ${compact ? "mt-1" : ""}`}>
          {compact && displayAddress && <div>{displayAddress}</div>}
          {displayEmail && <div>{displayEmail}</div>}
          {displayPhone && <div>{displayPhone}</div>}
          {displayWebsite && <div>{displayWebsite}</div>}
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
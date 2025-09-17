import React from 'react';
import { useBusinessProfile } from '@/hooks/use-business-profile';

interface TermsConditionsProps {
  showPaymentTerms?: boolean;
  customTerms?: string;
}

export function TermsConditions({ 
  showPaymentTerms = true, 
  customTerms 
}: TermsConditionsProps) {
  const { businessProfile } = useBusinessProfile();

  const defaultTerms = [
    "Payment is due within 30 days of invoice date.",
    "Late payments may incur additional charges.",
    "All prices are exclusive of applicable taxes unless stated otherwise.",
    "Goods remain the property of the seller until full payment is received.",
    "Any disputes must be raised within 7 days of delivery.",
  ];

  const paymentDetails = {
    bankName: businessProfile?.bankName || "Your Bank Name",
    accountName: businessProfile?.accountName || businessProfile?.name || "Business Account Name", 
    accountNumber: businessProfile?.accountNumber || "123456789",
    routingNumber: businessProfile?.routingNumber || "987654321",
  };

  return (
    <div className="mt-8 pt-4 border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted-foreground">
        <div>
          <h4 className="font-semibold text-foreground mb-3">Terms & Conditions</h4>
          <ul className="space-y-1">
            {customTerms ? (
              customTerms.split('\n').map((term, index) => (
                <li key={index}>• {term}</li>
              ))
            ) : (
              defaultTerms.map((term, index) => (
                <li key={index}>• {term}</li>
              ))
            )}
          </ul>
        </div>
        
        {showPaymentTerms && (
          <div>
            <h4 className="font-semibold text-foreground mb-3">Payment Details</h4>
            <div className="space-y-1">
              <div><strong>Bank:</strong> {paymentDetails.bankName}</div>
              <div><strong>Account Name:</strong> {paymentDetails.accountName}</div>
              <div><strong>Account Number:</strong> {paymentDetails.accountNumber}</div>
              <div><strong>Routing Number:</strong> {paymentDetails.routingNumber}</div>
              {businessProfile?.swiftCode && (
                <div><strong>SWIFT Code:</strong> {businessProfile.swiftCode}</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
        <p>This document was generated automatically and is valid without signature.</p>
        {businessProfile?.website && (
          <p>For questions, visit <span className="font-medium">{businessProfile.website}</span> or contact us directly.</p>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign, Euro, PoundSterling, IndianRupee } from 'lucide-react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  icon: React.ReactNode;
}

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', icon: <DollarSign className="h-4 w-4" /> },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', icon: <Euro className="h-4 w-4" /> },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', icon: <PoundSterling className="h-4 w-4" /> },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', icon: <span className="h-4 w-4 text-sm font-bold">¥</span> },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', icon: <IndianRupee className="h-4 w-4" /> },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha', locale: 'en-MW', icon: <span className="h-4 w-4 text-sm font-bold">MK</span> },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA', icon: <span className="h-4 w-4 text-sm font-bold">R</span> },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE', icon: <span className="h-4 w-4 text-sm font-bold">KSh</span> },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG', icon: <span className="h-4 w-4 text-sm font-bold">₦</span> },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH', icon: <span className="h-4 w-4 text-sm font-bold">GH₵</span> },
];

interface CurrencySelectorProps {
  value?: string;
  onValueChange?: (currency: Currency) => void;
  label?: string;
  className?: string;
}

export function CurrencySelector({ 
  value, 
  onValueChange, 
  label = "Currency", 
  className 
}: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencies.find(c => c.code === value) || currencies[0]
  );

  useEffect(() => {
    if (value) {
      const currency = currencies.find(c => c.code === value);
      if (currency) {
        setSelectedCurrency(currency);
      }
    }
  }, [value]);

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (currency) {
      setSelectedCurrency(currency);
      onValueChange?.(currency);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <Select value={selectedCurrency.code} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="h-11">
          <SelectValue>
            <div className="flex items-center gap-2">
              {selectedCurrency.icon}
              <span className="font-medium">{selectedCurrency.code}</span>
              <span className="text-muted-foreground">({selectedCurrency.symbol})</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center gap-2">
                {currency.icon}
                <div className="flex flex-col">
                  <span className="font-medium">{currency.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {currency.code} ({currency.symbol})
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default CurrencySelector;
export { currencies, type Currency };
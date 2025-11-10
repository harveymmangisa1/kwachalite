'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencySelector, currencies, type Currency } from '@/components/ui/currency-selector';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Settings as SettingsIcon } from 'lucide-react';

export default function CurrencySettingsPage() {
  const { toast } = useToast();
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencies[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load current currency from localStorage or environment
    const savedCurrencyCode = localStorage.getItem('kwachalite-currency');
    const envCurrencyCode = import.meta.env.VITE_CURRENCY_CODE || 'USD';
    const currencyCode = savedCurrencyCode || envCurrencyCode;
    
    const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
    setCurrentCurrency(currency);
  }, []);

  const handleCurrencyChange = async (currency: Currency) => {
    setIsLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('kwachalite-currency', currency.code);
      
      // Update environment variable for current session
      (import.meta.env as any).VITE_CURRENCY_CODE = currency.code;
      (import.meta.env as any).VITE_CURRENCY_SYMBOL = currency.symbol;
      (import.meta.env as any).VITE_LOCALE = currency.locale;
      
      setCurrentCurrency(currency);
      
      toast({
        title: 'Currency Updated',
        description: `Currency changed to ${currency.name} (${currency.code})`,
      });
      
      // Reload the page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update currency. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        title="Currency Settings"
        description="Configure your preferred currency and regional settings."
      />
      
      <div className="space-y-6 px-4 sm:px-6 max-w-2xl">
        <Card className="card-minimal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency Selection
            </CardTitle>
            <CardDescription>
              Choose your preferred currency for all financial calculations and displays.
              This will affect how money amounts are formatted throughout the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <CurrencySelector
                value={currentCurrency.code}
                onValueChange={handleCurrencyChange}
                label="Select Currency"
              />
            </div>
            
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Selection:</h4>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  {currentCurrency.icon}
                  <div>
                    <p className="font-medium">{currentCurrency.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Code: {currentCurrency.code} | Symbol: {currentCurrency.symbol}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Sample Formatting:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Positive Amount</p>
                    <p className="font-mono font-medium">
                      {new Intl.NumberFormat(currentCurrency.locale, {
                        style: 'currency',
                        currency: currentCurrency.code,
                      }).format(1234.56)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Negative Amount</p>
                    <p className="font-mono font-medium text-red-600">
                      {new Intl.NumberFormat(currentCurrency.locale, {
                        style: 'currency',
                        currency: currentCurrency.code,
                      }).format(-1234.56)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-1">Large Amount</p>
                    <p className="font-mono font-medium">
                      {new Intl.NumberFormat(currentCurrency.locale, {
                        style: 'currency',
                        currency: currentCurrency.code,
                      }).format(999999.99)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-minimal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Additional Currencies
            </CardTitle>
            <CardDescription>
              Don't see your currency? Contact support to request additional currency support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currencies.map((currency) => (
                <div 
                  key={currency.code}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    currentCurrency.code === currency.code 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                  onClick={() => handleCurrencyChange(currency)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {currency.icon}
                    <span className="font-medium">{currency.code}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{currency.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
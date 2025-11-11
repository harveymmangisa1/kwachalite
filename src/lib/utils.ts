import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { appConfig } from './config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  // Get current currency config dynamically
  const currencyConfig = getCurrencyConfig();
  
  // Use Intl.NumberFormat with proper currency support
  try {
    const formatter = new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
    });
    return formatter.format(amount);
  } catch (error) {
    // Fallback to custom formatting if currency code is not supported
    console.warn(`Currency code ${currencyConfig.code} not supported, using fallback formatting`);
    const formatter = new Intl.NumberFormat(currencyConfig.locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${currencyConfig.symbol} ${formatter.format(amount)}`;
  }
}

// Helper function to get current currency config
function getCurrencyConfig() {
  if (typeof window !== 'undefined') {
    const savedCurrency = localStorage.getItem('kwachalite-currency');
    if (savedCurrency) {
      return {
        code: savedCurrency,
        symbol: getCurrencySymbol(savedCurrency),
        locale: getCurrencyLocale(savedCurrency),
      };
    }
  }
  
  return appConfig.currency;
}

function getCurrencySymbol(code: string): string {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'INR': '₹',
    'MWK': 'MK',
    'ZAR': 'R',
    'KES': 'KSh',
    'NGN': '₦',
    'GHS': 'GH₵',
  };
  return symbols[code] || '$';
}

function getCurrencyLocale(code: string): string {
  const locales: { [key: string]: string } = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'JPY': 'ja-JP',
    'INR': 'en-IN',
    'MWK': 'en-MW',
    'ZAR': 'en-ZA',
    'KES': 'en-KE',
    'NGN': 'en-NG',
    'GHS': 'en-GH',
  };
  return locales[code] || 'en-US';
}

export function getCurrentCurrencySymbol() {
  const currencyConfig = getCurrencyConfig();
  return currencyConfig.symbol;
}

export function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid date';
  }
}

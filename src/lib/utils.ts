import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { appConfig } from './config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  // Use Intl.NumberFormat with proper currency support
  try {
    const formatter = new Intl.NumberFormat(appConfig.currency.locale, {
      style: 'currency',
      currency: appConfig.currency.code,
    });
    return formatter.format(amount);
  } catch (error) {
    // Fallback to custom formatting if currency code is not supported
    console.warn(`Currency code ${appConfig.currency.code} not supported, using fallback formatting`);
    const formatter = new Intl.NumberFormat(appConfig.currency.locale, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${appConfig.currency.symbol} ${formatter.format(amount)}`;
  }
}

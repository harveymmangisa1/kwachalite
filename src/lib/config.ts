// Application configuration based on environment variables

interface AppConfig {
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  app: {
    name: string;
    url: string;
    port: number;
    host: string;
  };
  defaults: {
    budgets: {
      groceries: number;
      transport: number;
      housing: number;
      food: number;
      entertainment: number;
      office: number;
      software: number;
    };
  };
}

const getEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

// Dynamic currency configuration
const getCurrencyConfig = () => {
  // Check localStorage first for user preference
  const savedCurrency = typeof window !== 'undefined' 
    ? localStorage.getItem('kwachalite-currency') 
    : null;
  
  const currencyCode = savedCurrency || getEnvVar('VITE_CURRENCY_CODE', 'USD');
  const currencySymbol = getCurrencySymbol(currencyCode);
  const locale = getCurrencyLocale(currencyCode);
  
  return {
    code: currencyCode,
    symbol: currencySymbol,
    locale: locale,
  };
};

const getCurrencySymbol = (code: string): string => {
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
  return symbols[code] || getEnvVar('VITE_CURRENCY_SYMBOL', '$');
};

const getCurrencyLocale = (code: string): string => {
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
  return locales[code] || getEnvVar('VITE_LOCALE', 'en-US');
};

export const appConfig: AppConfig = {
  currency: getCurrencyConfig(),
  app: {
    name: getEnvVar('VITE_APP_NAME', 'KwachaLite'),
    url: getEnvVar('VITE_APP_URL', 'http://localhost:3000'),
    port: getEnvNumber('VITE_PORT', 3000),
    host: getEnvVar('VITE_HOST', 'localhost'),
  },
  defaults: {
    budgets: {
      groceries: getEnvNumber('VITE_DEFAULT_GROCERY_BUDGET', 50000),
      transport: getEnvNumber('VITE_DEFAULT_TRANSPORT_BUDGET', 30000),
      housing: getEnvNumber('VITE_DEFAULT_HOUSING_BUDGET', 100000),
      food: getEnvNumber('VITE_DEFAULT_FOOD_BUDGET', 40000),
      entertainment: getEnvNumber('VITE_DEFAULT_ENTERTAINMENT_BUDGET', 25000),
      office: getEnvNumber('VITE_DEFAULT_OFFICE_BUDGET', 20000),
      software: getEnvNumber('VITE_DEFAULT_SOFTWARE_BUDGET', 15000),
    },
  },
};

export default appConfig;
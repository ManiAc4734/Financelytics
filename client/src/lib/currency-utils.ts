import { BASE_CURRENCY } from "@shared/schema";

// Exchange rates (in production, these would come from an API)
export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  GBP: {
    GBP: 1.0,
    ZAR: 23.50, // 1 GBP = 23.50 ZAR (approximate rate)
    USD: 1.25,  // 1 GBP = 1.25 USD
    EUR: 1.15,  // 1 GBP = 1.15 EUR
  },
  ZAR: {
    GBP: 0.0426, // 1 ZAR = 0.0426 GBP
    ZAR: 1.0,
    USD: 0.053,  // 1 ZAR = 0.053 USD
    EUR: 0.049,  // 1 ZAR = 0.049 EUR
  },
  USD: {
    GBP: 0.80,   // 1 USD = 0.80 GBP
    ZAR: 18.80,  // 1 USD = 18.80 ZAR
    USD: 1.0,
    EUR: 0.92,   // 1 USD = 0.92 EUR
  },
  EUR: {
    GBP: 0.87,   // 1 EUR = 0.87 GBP
    ZAR: 20.43,  // 1 EUR = 20.43 ZAR
    USD: 1.09,   // 1 EUR = 1.09 USD
    EUR: 1.0,
  },
};

export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1.0;
  
  const fromRates = EXCHANGE_RATES[fromCurrency];
  if (!fromRates || !fromRates[toCurrency]) {
    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return 1.0;
  }
  
  return fromRates[toCurrency];
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const rate = getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

export function convertToBaseCurrency(amount: number, fromCurrency: string): number {
  return convertCurrency(amount, fromCurrency, BASE_CURRENCY);
}

export function convertFromBaseCurrency(amount: number, toCurrency: string): number {
  return convertCurrency(amount, BASE_CURRENCY, toCurrency);
}

export function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    GBP: "£",
    ZAR: "R",
    USD: "$",
    EUR: "€",
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${Math.abs(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyWithSign(amount: number, currency: string): string {
  const formatted = formatCurrency(Math.abs(amount), currency);
  return amount >= 0 ? formatted : `-${formatted}`;
}
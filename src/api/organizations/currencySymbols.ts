
// Map of currency codes to their symbols
export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: '$',
  AUD: '$',
  JPY: '¥',
  CNY: '¥',
  SEK: 'kr',
  DKK: 'kr',
  NOK: 'kr',
  // Add more currencies as needed
};

// Default symbol if currency not found
export const getSymbolForCurrency = (currencyCode: string): string => {
  return currencySymbols[currencyCode] || '';
};

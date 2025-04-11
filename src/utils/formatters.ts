
export const DateFormatter = {
  format: (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
};

export const formatCurrency = (amount: number | undefined | null, currency = 'USD') => {
  if (amount === undefined || amount === null) return "—";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

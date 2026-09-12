const defaultCurrencyConfig = {
  code: "NGN",
  symbol: "₦",
  locale: "en-NG",
  rate: 1,
};

let activeCurrencyConfig = { ...defaultCurrencyConfig };

export function setCurrencyConfig(_config = {}) {
  // Currency is strictly Naira (₦) across the platform
  activeCurrencyConfig = {
    code: "NGN",
    symbol: "₦",
    locale: "en-NG",
    rate: 1,
  };
}

export function getCurrencyConfig() {
  return activeCurrencyConfig;
}

export function formatCurrency(amount) {
  const numericAmount = Number(amount || 0);
  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);

  return `₦${formatted}`;
}

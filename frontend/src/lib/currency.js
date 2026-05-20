const defaultCurrencyConfig = {
  code: String(import.meta.env.VITE_APP_CURRENCY_CODE || "USD").toUpperCase(),
  locale: String(import.meta.env.VITE_APP_CURRENCY_LOCALE || "en-US"),
  rate: Number(import.meta.env.VITE_APP_CURRENCY_RATE || 1) || 1,
};

let activeCurrencyConfig = { ...defaultCurrencyConfig };

export function setCurrencyConfig(config = {}) {
  activeCurrencyConfig = {
    code: String(config.code || defaultCurrencyConfig.code).toUpperCase(),
    locale: String(config.locale || defaultCurrencyConfig.locale),
    rate: Number(config.rate || defaultCurrencyConfig.rate || 1) || 1,
  };
}

export function getCurrencyConfig() {
  return activeCurrencyConfig;
}

export function formatCurrency(amount) {
  const { code, locale, rate } = activeCurrencyConfig;
  const displayAmount = Number(amount || 0) * (Number(rate || 1) || 1);

  if (code === "NGN") {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(displayAmount).replace(/^/, "₦");
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(displayAmount);
}

export function formatCurrencyFromCents(valueInCents: number, locale = "en-US", currency = "USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(valueInCents / 100);
}

export function centsToDecimal(valueInCents: number) {
  return valueInCents / 100;
}


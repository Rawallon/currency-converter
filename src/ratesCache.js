// Last known USD-based rate table, kept in localStorage so the app still works offline.
// Any pair can be derived from it: rate(from -> to) = rates[to] / rates[from].
const KEY = "currencyversion:rates";

export function loadRates() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.rates && saved.rates.USD === 1) return saved;
  } catch (e) {
    // storage unavailable or corrupted: behave as if nothing is cached
  }
  return null;
}

export function saveRates(rates, date) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ rates, date }));
  } catch (e) {
    // storage full or blocked: caching is best effort
  }
}

export function crossRate(rates, from, to) {
  return rates && rates[from] && rates[to] ? rates[to] / rates[from] : null;
}

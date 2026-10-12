// Last known USD-based rate table, kept in localStorage so the app still works offline.
// Any pair can be derived from it: rate(from -> to) = rates[to] / rates[from].
const KEY = "currencyversion:rates";

const isValid = (saved) =>
  saved &&
  typeof saved.date === "string" &&
  saved.rates &&
  saved.rates.USD === 1 &&
  Object.values(saved.rates).every((n) => Number.isFinite(n) && n > 0);

export function loadRates() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (isValid(saved)) return { rates: saved.rates, date: saved.date };
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

// "Oct 9 (2 days ago)". The date is the ECB reference day, so weekends and holidays
// make it lag the calendar by a few days even when the data is current.
export function describeDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const day = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((today - day) / 86400000);
  const label = day.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (days <= 0) return `${label} (today)`;
  if (days === 1) return `${label} (yesterday)`;
  return `${label} (${days} days ago)`;
}

// Extra target currencies shown under the main pair
export const MAX_EXTRAS = 4;
const EXTRAS_KEY = "currencyversion:extras";

export function loadExtras() {
  try {
    const saved = JSON.parse(localStorage.getItem(EXTRAS_KEY));
    if (Array.isArray(saved)) {
      return saved.filter((code) => typeof code === "string").slice(0, MAX_EXTRAS);
    }
  } catch (e) {
    // storage unavailable or corrupted: start with none
  }
  return [];
}

export function saveExtras(extras) {
  try {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras));
  } catch (e) {
    // best effort
  }
}

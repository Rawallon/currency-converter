import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import logo from "./logo.png";
import Currencyfield from "./components/CurrencyField";
import InstallButton from "./components/InstallButton";
import {
  loadRates,
  saveRates,
  crossRate,
  describeDate,
  loadExtras,
  saveExtras,
  MAX_EXTRAS,
} from "./ratesCache";

const API = "https://api.frankfurter.dev/v1/latest";

const format = (n) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");

// Refresh a long-lived tab (e.g. the installed app) when it comes back after this long
const REFRESH_AFTER_MS = 60 * 60 * 1000;

function App() {
  // Last known rates from a previous visit, so the app is usable before the network answers
  const [table, setTable] = useState(() => {
    const cached = loadRates();
    return cached && { ...cached, fresh: false };
  });
  const tableRef = useRef(table);
  tableRef.current = table;

  const [fromAmount, setFromAmount] = useState("1.00");
  const [toAmount, setToAmount] = useState("1.00");
  const [fromSelected, setFromSelected] = useState("USD");
  const [toSelected, setToSelected] = useState(() =>
    table ? Object.keys(table.rates).find((c) => c !== "USD") : "USD"
  );
  const [hoverMouse, setHoverMouse] = useState(true); // Animation
  // The rate in use: how many `to` units 1 `from` is worth, and where it came from.
  // source is "live" (fetched this session) or "cache" (saved from an earlier visit).
  // The API only gives us this per pair; typing an amount is pure front-end math against it.
  const [rateInfo, setRateInfo] = useState({ rate: 1, source: "live", date: null });
  const [offline, setOffline] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const lastLoaded = useRef(0);
  // Extra currencies converted from the same amount. They use the rate table the app
  // already holds, so they cost no extra requests and keep working offline.
  const [extras, setExtras] = useState(loadExtras);
  const [editing, setEditing] = useState(null); // { index, text } while typing in an extra
  useEffect(() => saveExtras(extras), [extras]);

  const currencyOptions = table ? Object.keys(table.rates) : ["USD"];
  const { rate } = rateInfo;

  const shownExtras = table
    ? extras
        .map((code, index) => ({ code, index, rate: crossRate(table.rates, fromSelected, code) }))
        .filter((extra) => extra.rate)
    : [];

  // Load the full rate table and cache it
  useEffect(() => {
    fetch(`${API}?base=USD`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load exchange rates");
        return res.json();
      })
      .then((data) => {
        const rates = { USD: 1, ...data.rates };
        saveRates(rates, data.date);
        lastLoaded.current = Date.now();
        setTable({ rates, date: data.date, fresh: true });
        setToSelected((current) => (current === "USD" ? Object.keys(data.rates)[0] : current));
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, [refreshTick]);

  // Hit the API only when a currency changes
  useEffect(() => {
    if (fromSelected === toSelected) {
      setRateInfo({ rate: 1, source: "live", date: null });
      return;
    }
    // Show the best local answer straight away instead of the previous pair's rate
    const known = tableRef.current;
    const local = known && crossRate(known.rates, fromSelected, toSelected);
    setRateInfo(
      local
        ? { rate: local, source: known.fresh ? "live" : "cache", date: known.date }
        : { rate: null, source: "cache", date: null }
    );

    let stale = false;
    fetch(`${API}?base=${fromSelected}&symbols=${toSelected}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load exchange rate");
        return res.json();
      })
      .then((data) => {
        if (stale) return;
        lastLoaded.current = Date.now();
        setRateInfo({ rate: data.rates[toSelected], source: "live", date: data.date });
        setOffline(false);
      })
      .catch(() => {
        if (!stale) setOffline(true);
      });
    return () => {
      stale = true;
    };
  }, [fromSelected, toSelected, refreshTick]);

  // A tab that stays open for days would otherwise keep old rates until a currency changes
  useEffect(() => {
    const refresh = () => {
      const old = Date.now() - lastLoaded.current > REFRESH_AFTER_MS;
      if (document.visibilityState === "visible" && (offline || old)) {
        setRefreshTick((n) => n + 1);
      }
    };
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [offline]);

  // Keep the result in sync with the rate in use
  useEffect(() => {
    setToAmount(rate ? format(Math.abs(parseFloat(fromAmount)) * rate) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  // The field being typed in keeps its raw text; only the other side is formatted
  const changeInputFrom = (e) => {
    const value = Math.abs(parseFloat(e.target.value));
    setFromAmount(e.target.value);
    if (rate) setToAmount(value ? format(value * rate) : "0.00");
  };

  const changeInputTo = (e) => {
    const value = Math.abs(parseFloat(e.target.value));
    setToAmount(e.target.value);
    if (rate) setFromAmount(value ? format(value / rate) : "0.00");
  };

  const changeSelectFrom = (code) => setFromSelected(code);
  const changeSelectTo = (code) => setToSelected(code);

  const addExtra = () => {
    const used = new Set([fromSelected, toSelected, ...extras]);
    const next = currencyOptions.find((code) => !used.has(code)) || currencyOptions[0];
    setExtras([...extras, next]);
  };
  const removeExtra = (index) => {
    setEditing(null);
    setExtras(extras.filter((_, i) => i !== index));
  };
  const changeExtraCode = (index, code) =>
    setExtras(extras.map((current, i) => (i === index ? code : current)));
  // Typing in an extra sets the base amount, like typing in the main "to" box
  const changeExtraAmount = (index, extraRate, e) => {
    const value = Math.abs(parseFloat(e.target.value));
    const base = value ? value / extraRate : 0;
    setEditing({ index, text: e.target.value });
    setFromAmount(format(base));
    if (rate) setToAmount(format(base * rate));
  };

  // Tell the user when the number on screen is not live data
  const extrasSaved = shownExtras.length > 0 && table && !table.fresh;
  let note = null;
  if (!table && offline) {
    note = { text: "You're offline and no rates are saved yet. Connect once to load them." };
  } else if (!rate && offline) {
    note = { text: `Offline: no saved rate for ${fromSelected} to ${toSelected}.` };
  } else if ((rateInfo.source === "cache" && rate) || extrasSaved) {
    const saved = describeDate(rateInfo.source === "cache" && rateInfo.date ? rateInfo.date : table.date);
    note = offline
      ? { text: `Offline: showing saved rates from ${saved}` }
      : { text: `Updating rates\u2026 (saved ${saved})`, delayed: true };
  }

  return (
    <div className="App">
      <div className="content">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="row">
          <Currencyfield
            hoverMouse={hoverMouse}
            setHoverMouse={setHoverMouse}
            selectedCurrency={fromSelected}
            setSelectedCurrency={changeSelectFrom}
            currencyOptions={currencyOptions}
            currencyQuant={fromAmount}
            changeInput={changeInputFrom}
            type={'from'}
          />
          <span> is worth </span>
          <Currencyfield
            hoverMouse={hoverMouse}
            setHoverMouse={setHoverMouse}
            selectedCurrency={toSelected}
            setSelectedCurrency={changeSelectTo}
            currencyOptions={currencyOptions}
            currencyQuant={toAmount}
            changeInput={changeInputTo}
            type={'to'}

          />
        </div>
        {shownExtras.map(({ code, index, rate: extraRate }) => (
          <div className="row extra" key={index}>
            <button
              className="extra-remove"
              onClick={() => removeExtra(index)}
              aria-label={`Remove ${code}`}
              title="Remove"
            >
              &times;
            </button>
            <Currencyfield
              hoverMouse={hoverMouse}
              setHoverMouse={setHoverMouse}
              selectedCurrency={code}
              setSelectedCurrency={(next) => changeExtraCode(index, next)}
              currencyOptions={currencyOptions}
              currencyQuant={
                editing && editing.index === index
                  ? editing.text
                  : format(parseFloat(fromAmount) * extraRate)
              }
              changeInput={(e) => changeExtraAmount(index, extraRate, e)}
              onBlur={() => setEditing(null)}
              type={"extra"}
            />
          </div>
        ))}
        {table && extras.length < MAX_EXTRAS && (
          <button className="add-currency" onClick={addExtra} aria-label="Add another currency" title="Add currency">
            +
          </button>
        )}
      </div>
      {note && (
        <p className={note.delayed ? "rate-note rate-note-delayed" : "rate-note"} role="status">
          {note.text}
        </p>
      )}
      <InstallButton />
    </div>
  );
}

export default App;

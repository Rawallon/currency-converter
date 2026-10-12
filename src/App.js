import React, { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.png";
import Currencyfield from "./components/CurrencyField";
import InstallButton from "./components/InstallButton";
import { loadRates, saveRates, crossRate } from "./ratesCache";

const API = "https://api.frankfurter.dev/v1/latest";

const format = (n) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");

function App() {
  // Last known rates (from a previous visit), so the app is usable before the network answers
  const [table, setTable] = useState(loadRates);
  const [fromAmount, setFromAmount] = useState("1.00");
  const [toAmount, setToAmount] = useState("1.00");
  const [fromSelected, setFromSelected] = useState("USD");
  const [toSelected, setToSelected] = useState(() => {
    const cached = loadRates();
    return cached ? Object.keys(cached.rates).find((c) => c !== "USD") : "USD";
  });
  const [hoverMouse, setHoverMouse] = useState(true); // Animation
  // How many `to` units 1 `from` is worth. The only thing the API gives us per pair;
  // typing an amount is pure front-end math against it.
  const [rate, setRate] = useState(() =>
    table ? crossRate(table.rates, "USD", toSelected) || 1 : 1
  );
  const [offline, setOffline] = useState(false);

  const currencyOptions = table ? Object.keys(table.rates) : ["USD"];

  // Load the full rate table once and cache it
  useEffect(() => {
    fetch(`${API}?base=USD`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load exchange rates");
        return res.json();
      })
      .then((data) => {
        const rates = { USD: 1, ...data.rates };
        saveRates(rates, data.date);
        setTable({ rates, date: data.date });
        setToSelected((current) => (current === "USD" ? Object.keys(data.rates)[0] : current));
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, []);

  // Hit the API only when a currency changes; fall back to the cached table if it fails
  useEffect(() => {
    if (fromSelected === toSelected) {
      setRate(1);
      return;
    }
    let stale = false;
    fetch(`${API}?base=${fromSelected}&symbols=${toSelected}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load exchange rate");
        return res.json();
      })
      .then((data) => {
        if (stale) return;
        setRate(data.rates[toSelected]);
        setOffline(false);
      })
      .catch(() => {
        if (stale) return;
        const cached = crossRate((table || loadRates() || {}).rates, fromSelected, toSelected);
        if (cached) setRate(cached);
        setOffline(true);
      });
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromSelected, toSelected]);

  // Keep the result in sync with the stored rate
  useEffect(() => {
    setToAmount(format(Math.abs(parseFloat(fromAmount)) * rate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  // The field being typed in keeps its raw text; only the other side is formatted
  const changeInputFrom = (e) => {
    const value = Math.abs(parseFloat(e.target.value));
    setFromAmount(e.target.value);
    setToAmount(value ? format(value * rate) : "0.00");
  };

  const changeInputTo = (e) => {
    const value = Math.abs(parseFloat(e.target.value));
    setToAmount(e.target.value);
    setFromAmount(value ? format(value / rate) : "0.00");
  };

  const changeSelectFrom = (code) => setFromSelected(code);
  const changeSelectTo = (code) => setToSelected(code);

  return (
    <div className="App">
      <div className="content">
        <img src={logo} className="App-logo" alt="logo" />
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
      {offline && table && (
        <p className="offline-note">Offline: rates from {table.date}</p>
      )}
      <InstallButton />
    </div>
  );
}

export default App;

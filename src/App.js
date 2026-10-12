import React, { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.png";
import Currencyfield from "./components/CurrencyField";
import InstallButton from "./components/InstallButton";

const API = "https://api.frankfurter.dev/v1/latest";

const format = (n) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");

function App() {
  const [fromAmount, setFromAmount] = useState("1.00");
  const [toAmount, setToAmount] = useState("1.00");
  const [fromSelected, setFromSelected] = useState("USD");
  const [toSelected, setToSelected] = useState("USD");
  const [hoverMouse, setHoverMouse] = useState(true); // Animation
  const [currencyOptions, setCurrencyOptions] = useState(["USD"]);
  // How many `to` units 1 `from` is worth. The only thing the API gives us per pair;
  // typing an amount is pure front-end math against it.
  const [rate, setRate] = useState(1);

  // Load the currency list once
  useEffect(() => {
    fetch(`${API}?base=USD`)
      .then((res) => res.json())
      .then((data) => {
        const codes = ["USD", ...Object.keys(data.rates)];
        const first = codes[1];
        setCurrencyOptions(codes);
        setToSelected(first);
      });
  }, []);

  // Hit the API only when a currency changes
  useEffect(() => {
    if (fromSelected === toSelected) {
      setRate(1);
      return;
    }
    let stale = false;
    fetch(`${API}?base=${fromSelected}&symbols=${toSelected}`)
      .then((res) => res.json())
      .then((data) => {
        if (!stale) setRate(data.rates[toSelected]);
      });
    return () => {
      stale = true;
    };
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
      <InstallButton />
    </div>
  );
}

export default App;

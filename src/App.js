import React, { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.png";
import Currencyfield from "./components/CurrencyField";

function App() {

  //Input
  const [fromCurrency, setFromCurrency] = useState(1.0);
  const [toCurrency, setToCurrency] = useState(1.0);
  //Select
  const [fromSelected, setFromSelected] = useState("USD")
  const [toSelected, setToSelected] = useState("EUR")
  //Misc
  const [hoverMouse, setHoverMouse] = useState(true); //Animation
  const [exchangeRates, setExchangeRates] = useState({});
  const [currencyOptions, setCurrencyOptions] = useState([]);

  useEffect(() => {
    fetch(`https://api.frankfurter.dev/v1/latest?base=${fromSelected}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load exchange rates");
        return res.json();
      })
      .then((res) => {
        setExchangeRates({ ...res.rates, [res.base]: 1 });
        setCurrencyOptions(
          Array.from(new Set([res.base, ...Object.keys(res.rates)]))
        );
      })
      .catch((error) => console.error(error));
  }, [fromSelected]);

  //Controls the inputs
  //this could also be done base on e.target.id
  const changeInputFrom = (e) => {
    if (e.target.value === "" || e.target.value === 0) {
      setToCurrency(0.0);
      return;
    }
    setFromCurrency(parseFloat(e.target.value).toFixed(2));
    setToCurrency(
      parseFloat(
        Math.abs(e.target.value) *
          exchangeRates[toSelected]
      ).toFixed(2)
    );
  };

  const changeInputTo = (e) => {
    if (e.target.value === "" || e.target.value === 0) {
      setFromCurrency(0.0);
      return;
    }
    setToCurrency(parseFloat(e.target.value).toFixed(2));
    setFromCurrency(
      parseFloat(
        Math.abs(e.target.value) /
          exchangeRates[toSelected]
      ).toFixed(2)
    );
  };

    //Controls the selects
    const changeSelectFrom = (e) => {
      setFromSelected(e)
    }
  
    const changeSelectTo = (e) => {
      setToSelected(e)
    }

  useEffect(() => {
    if (exchangeRates[toSelected]) {
      setToCurrency(
        parseFloat(fromCurrency * exchangeRates[toSelected]).toFixed(2)
      );
    }
  }, [exchangeRates, fromCurrency, toSelected]);


  
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
          currencyQuant={fromCurrency}
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
          currencyQuant={toCurrency}
          changeInput={changeInputTo}
          type={'to'}

        />
      </div>
    </div>
  );
}

export default App;

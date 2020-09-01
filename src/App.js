import React, { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.png";
import Currencyfield from "./components/CurrencyField";

function App() {

  //Input
  const [fromCurrency, setFromCurrency] = useState(1.0);
  const [toCurrency, setToCurrency] = useState(1.0);
  //Select
  const [fromSelected, setFromSelected] = useState("")
  const [toSelected, setToSelected] = useState("")
  //Misc
  const [hoverMouse, setHoverMouse] = useState(true); //Animation
  const [exchangeRates, setExchangeRates] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  useEffect(() => {
    //  First fetch when the page is loaded
    fetch("https://api.exchangeratesapi.io/latest?base=USD")
      .then((res) => res.json())
      .then((res) => {
        //Changes the "select"
        setCurrencyOptions(Object.keys(res.rates));
        setFromSelected(res.base)
        setToSelected(Object.keys(res.rates)[0])
        //Sets the exchange rate value and changes the input
        setExchangeRates(Object.values(res.rates));
        setFromCurrency(parseFloat(1.0).toFixed(2));
        setToCurrency(
          parseFloat(res.rates[Object.keys(res.rates)[0]]).toFixed(2)
        );
      });
  }, []);

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
          exchangeRates[currencyOptions.indexOf(toSelected)]
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
          exchangeRates[currencyOptions.indexOf(toSelected)]
      ).toFixed(2)
    );
  };

    //Controls the selects
    const changeSelectFrom = (e) => {
      setFromSelected(e)
      setToCurrency(parseFloat(toCurrency / exchangeRates[currencyOptions.indexOf(e)]).toFixed(2))
    }
  
    const changeSelectTo = (e) => {
      setToSelected(e)
      setFromCurrency(
        parseFloat(
          Math.abs(fromCurrency) /
            exchangeRates[currencyOptions.indexOf(toSelected)]
        ).toFixed(2))
    }

  useEffect(() => {
    // Watches if any of it was changed then gets a different exchange rate
    if (toSelected !== undefined && fromSelected !== undefined) {
      fetch(
        "https://api.exchangeratesapi.io/latest?base=" + fromSelected
      )
        .then((res) => res.json())
        .then((data) => setExchangeRates(Object.values(data.rates)));
    }
  }, [toSelected,fromSelected]);


  
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

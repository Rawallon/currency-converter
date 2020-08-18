import React, { useEffect, useState } from "react";
import { DebounceInput } from "react-debounce-input";
import "./App.css";
import logo from './logo.png';
import cData from './CurrencyData';

function App() {
  const [hoverMouse, setHoverMouse] = useState(true) //Animation

  const [exchangeRates, setExchangeRates] = useState([])
  const [currencyOptions, setCurrencyOptions] = useState([])
  const [selectedCurrency, setSelectedCurrency] = useState([])
  const [fromCurrency, setFromCurrency] = useState(1.00)
  const [toCurrency, setToCurrency] = useState(1.00)

  useEffect(() => { //  First fetch when the page is loaded
    fetch('https://api.exchangeratesapi.io/latest?base=USD')
      .then(res => res.json())
      .then(res => {
        //Changes the "select"
        setCurrencyOptions(Object.keys(res.rates))
        setSelectedCurrency({ from: res.base, to: Object.keys(res.rates)[0] })
        //Sets the exchange rate value and changes the input
        setExchangeRates(Object.values(res.rates))
        setToCurrency(parseFloat(res.rates[Object.keys(res.rates)[0]]).toFixed(2))
      })
  }, []);

  //Controls the inputs
  //this could also be done base on e.target.id
  const changeInputFrom = (e) => {
    if(e.target.value === "" || e.target.value === 0) {setToCurrency(0.00); return;}
    setFromCurrency(parseFloat(Math.abs(e.target.value)).toFixed(2))
    setToCurrency(parseFloat(Math.abs(e.target.value) * exchangeRates[currencyOptions.indexOf(selectedCurrency.to)].toFixed(2)))
  }
  const changeInputTo = (e) => {
    if(e.target.value === "" || e.target.value === 0) {setFromCurrency(0.00); return;}
    setToCurrency(parseFloat(Math.abs(e.target.value)).toFixed(2))
    setFromCurrency(parseFloat(Math.abs(e.target.value) * exchangeRates[currencyOptions.indexOf(selectedCurrency.to)].toFixed(2)))
  }

  //Controls the selects
  const changeSelectFrom = (e) => {
    setSelectedCurrency({ ...selectedCurrency, from: e.target.value})
    setToCurrency(parseFloat(toCurrency / exchangeRates[currencyOptions.indexOf(e.target.value)]).toFixed(2))
  }

  const changeSelectTo = (e) => {
    setSelectedCurrency({ ...selectedCurrency, to: e.target.value})
    setFromCurrency(parseFloat(fromCurrency / exchangeRates[currencyOptions.indexOf(e.target.value)]).toFixed(2))
  }

  
  useEffect(() => { // Watches if any of it was changed then gets a different exchange rate
    if (selectedCurrency !== undefined && selectedCurrency.from !== undefined) {
      fetch('https://api.exchangeratesapi.io/latest?base=' + selectedCurrency.from)
        .then(res => res.json())
        .then(data => setExchangeRates(Object.values(data.rates)))
    }
  }, [selectedCurrency]) 
  return (
    <div className="App">
      <div className="content">
      <img src={logo} className="App-logo" alt="logo" />

        <select name="currency" id="currency" className={hoverMouse ? 'select-css' : 'show-css' } value={selectedCurrency.from} onChange={changeSelectFrom} onMouseEnter={() => setHoverMouse(true)} onMouseLeave={() => setHoverMouse(false)} >
          {currencyOptions.map(el => <option key={el} value={el} >{hoverMouse ? el : cData(el).symbol }</option>)}
        </select>
        {/* <input type="number" id="fromCurrency" value={fromCurrency} onChange={changeInputFrom}></input> */}
        <DebounceInput
          minLength={0}
          value={fromCurrency}
          type="number"
          debounceTimeout={500}
          onBlur={(e) => changeInputFrom(e)}
          onChange={e => changeInputFrom(e)} />
        <span> is worth </span>
        <select name="currency" id="currency" className={hoverMouse ? 'select-css' : 'show-css' } value={selectedCurrency.to} onChange={changeSelectTo} onMouseEnter={() => setHoverMouse(true)} onMouseLeave={() => setHoverMouse(false)} >
          {currencyOptions.map(el => <option key={el} value={el} >{hoverMouse ? el : cData(el).symbol }</option>)}
        </select>
        {/* <input type="number" id="toCurrency" value={toCurrency} onChange={changeInputTo} ></input> */}
        <DebounceInput
          type="number"
          minLength={0}
          value={toCurrency}
          debounceTimeout={500}
          onBlur={(e) => changeInputTo(e)}
          onChange={e => changeInputTo(e)} />
      </div>
    </div>
  );
}

export default App;

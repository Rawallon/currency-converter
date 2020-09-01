import React from "react";
import cData from './CurrencyData';
import { DebouncedField } from "./DebouncedField";

export default function Currencyfield({hoverMouse,setHoverMouse,selectedCurrency,setSelectedCurrency,currencyOptions,currencyQuant,changeInput,type}) {
    return (
    <>
      <select
        name="currency"
        id="currency"
        className={hoverMouse ? "select-css" : "show-css"}
        value={selectedCurrency}
        onMouseEnter={() => setHoverMouse(true)}
        onMouseLeave={() => setHoverMouse(false)}
        onChange={(e) => setSelectedCurrency(e.target.value)}
      >
        {currencyOptions.map((el) => (
          <option key={el} value={el}>
            {hoverMouse ? el : cData(el).symbol}
          </option>
        ))}
      </select>
      <DebouncedField
        minLength={0}
        value={currencyQuant}
        type="number"
        debounceTimeout={500}
        onChange={(e) => changeInput(e)}
      />
    </>
  );
}

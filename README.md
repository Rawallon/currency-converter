## Currencyversion
> For all you currency conversion needs!

**[Try it live](https://rawallon.github.io/currency-converter/)**

This was a quick currency conversion project made using React and [Frankfurter](https://frankfurter.dev/) in the style of [dolarhoje.com](https://dolarhoje.com/). Rates update daily and are intended for informational use.

## What it does

- **Converts as you type.** The rate is fetched only when you change a currency. Typing an amount is plain math against that rate, so there is no waiting on the network.
- **Several currencies at once.** A faint + under the card adds more currencies in a small card of their own (up to 4). Type in any of them and the rest follow. They are remembered between visits.
- **Works offline.** The last rates are saved in the browser. If you are offline, or the rates are still loading, the app says so and shows the date of the saved rates ("Offline: showing saved rates from Oct 8 (3 days ago)").
- **Installable.** On Chrome or Edge use the install icon in the address bar, or the Install app button. On iPhone use Share, then Add to Home Screen.
- **Fits phones.** The card scales down to fit small screens instead of overflowing.

![Typing an amount, adding currencies and editing one of them](docs/demo.gif)

> It uses both the name of the currency and its symbol

![Currency symbols shown when the mouse leaves the selects](docs/symbols.png)

This counts as a feature, right?

On a phone the card scales down to fit, with the extra currencies in their own card below it:

<img src="docs/mobile.png" alt="The converter on a phone" width="320">

## TODO
 - Graph showing selected currencies price
 - Maybe resizable input?

## Running it

```bash
# Clone this repo
git clone https://github.com/Rawallon/currency-converter
cd currency-converter

# Install and start
npm install
npm start
```

On Node 17 or newer, react-scripts 3 needs `NODE_OPTIONS=--openssl-legacy-provider` set to build. The GitHub Pages workflow already sets it.

## 🚧 As with anything in my profile this isn't the final version of it 🚧

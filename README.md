# Flask-stockMarketChart

Chart the stock market

Uses [Alpha Vantage to get the data](https://www.alphavantage.co/documentation/)

Make as part of [FreeCodeCamp's challenge](https://www.freecodecamp.org/learn/coding-interview-prep/take-home-projects/chart-the-stock-market)

[Link to live project](https://limitless-ridge-52978.up.railway.app/)

Also at [stocks.link477.com](https://stocks.link477.com/)

![Finished stock market chart](ChartTheStockMarket.jpg)

## Install

Use `npm install` to install the JavaScript dependencies and either pip or pipenv to install the Python dependencies.

## JavaScript Transpile

Use `npx prettier . --write` to run Prettier to format the code.

Use `tsc` to transpile the TypeScript into JavaScript.

Use `npm run build` to combine the JavaScript files into one file using WebPack.

<!-- To minify the JavaScript I used [the JavaScript minifier](https://www.toptal.com/developers/javascript-minifier) -->

## Run Python server

Use the following command to run the Flask server

```bash
py -m app
```

## Docker

Build with:

```bash
docker build -t stockmarketchart .
```

Run with:

```bash
docker run -d -p 5000:5000 stockmarketchart
```

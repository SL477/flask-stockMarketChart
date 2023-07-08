"use strict";

import { io } from "socket.io-client";
import {
  Chart,
  Colors,
  ChartDataset,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
// Tree shake Chart.JS
Chart.register(
  Colors,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const stocks: string[] = [];
const socket = io();

const STOCK_CODE: HTMLSelectElement = document.getElementById(
  "stockCode",
) as HTMLSelectElement;
const KEY: HTMLUListElement = document.getElementById(
  "key",
) as HTMLUListElement;
const HOLDER: HTMLCanvasElement = document.getElementById(
  "holder",
) as HTMLCanvasElement;
const BTN: HTMLElement | null = document.getElementById("btn");

/**
 * This is to get the selected stock market ticker
 * @returns void
 */
function getStockPrices() {
  if (STOCK_CODE) {
    const code: string = STOCK_CODE.value;
    if (!code || code === "") {
      alert("Stock code is required");
      return;
    }
    if (stocks.length >= 5) {
      alert("Maximum of 5 stocks to track");
    }
    stocks.push(code.toUpperCase());
    socket.emit("stocksReceived", stocks);

    // delete text
    STOCK_CODE.value = "";
  }
}

/**
 * This to send a particular stock to be removed
 * @param i Index of stock to remove
 */
function removeStock(stock: string) {
  console.log("remove", stock);
  socket.emit("removeStock", stock);
}

socket.on("stocks", function (event: string[]) {
  console.log("received data", event);
  const tempStocks = event;
  const tmp: string[] = [];
  if (KEY) {
    KEY.innerHTML = "";

    tempStocks.forEach((s: string) => {
      const split_s = s.split(" - ");
      const child: HTMLLIElement = document.createElement("li");
      child.onclick = () => removeStock(split_s[0]);
      child.tabIndex = KEY.childNodes.length + 1;
      child.onkeydown = (ev: KeyboardEvent) => {
        if (ev.key === "Enter") {
          removeStock(split_s[0]);
        }
      };
      child.textContent = s;
      KEY.appendChild(child);
      tmp.push(split_s[0]);
    });
  }
});

socket.on("message", function (event: string) {
  console.log("receivedMessage", event);
});

//#region "Draw stock market graph"
interface dataRow {
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose: number;
  volume: number;
  dividend: number;
  splitCoefficient: number;
  date: string;
  code: string;
}

let currentChart: Chart;
socket.on("stockGraph", function (event: string) {
  if (HOLDER) {
    HOLDER.innerHTML = "";

    // remove the current chart
    if (currentChart) {
      currentChart.destroy();
    }

    if (event === "{}") {
      return;
    }

    const orgData: dataRow[] = JSON.parse(event);

    // Get the stocks
    const tempStocks: string[] = [...new Set(orgData.map((data) => data.code))];

    const datasets: ChartDataset[] = [];
    tempStocks.forEach((stock) => {
      const dataset = {
        label: stock,
        data: orgData
          .filter((data) => data.code === stock)
          .map((data) => data.close),
        fill: false,
        tension: 0.1,
      };
      datasets.push(dataset);
    });

    const labels = [
      ...new Set(
        orgData.map((data) => new Date(data.date).toLocaleDateString()),
      ),
    ];

    currentChart = new Chart(HOLDER, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Close Amount ($)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Day",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
      },
    });
  }
});
//#endregion

//tie the button to the enter key on the input field
if (STOCK_CODE) {
  STOCK_CODE.addEventListener("keyup", function (ev: KeyboardEvent) {
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (BTN) {
        BTN.click();
      }
    }
  });
}

if (BTN) {
  BTN.addEventListener("click", getStockPrices);
}


//#region "Get the stock market tickers"
socket.emit("getTickers");

/**
 * This is to append all of the stock tickers to the datalist
 * @param TickerArray Retrieved from the backend, [code, description]
 */
function AppendToStockCodes(TickerArray: Array<[string, string]>) {
  const stockCodes: HTMLDataListElement | null = document.getElementById("stockCodes") as HTMLDataListElement | null;
  if (stockCodes) {
    TickerArray.forEach(ticker => {
      const tickerOption: HTMLOptionElement = document.createElement('option');
      tickerOption.value = ticker[0];
      tickerOption.text = `${ticker[0]} - ${ticker[1]}`;
      stockCodes.append(tickerOption);
    });
  }

}

socket.on("stockTickers", (msg: string) => {
  // convert to array of arrays
  msg = msg.replace(/'/g, '"').replace(/\(/g, '[').replace(/\)/g, ']');
  // console.log('stockTickers', msg);
  AppendToStockCodes(JSON.parse(msg));
});
//#endregion
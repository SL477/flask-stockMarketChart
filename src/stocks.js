"use strict";
import { io } from "./socket.io";
import Chart from 'chart.js/auto';
const stocks = [];
const socket = io();
const STOCK_CODE = document.getElementById("stockCode");
const KEY = document.getElementById("key");
const HOLDER = document.getElementById("holder");
const BTN = document.getElementById("btn");
function getStockPrices() {
    if (STOCK_CODE) {
        const code = STOCK_CODE.value;
        if (!code || code === "") {
            alert("Stock code is required");
            return;
        }
        if (stocks.length >= 5) {
            alert("Maximum of 5 stocks to track");
        }
        stocks.push(code.toUpperCase());
        socket.emit("stocksrec", stocks);
        // delete text
        STOCK_CODE.value = "";
    }
}
function removeStock(i) {
    socket.emit("removestock", stocks[i]);
}
socket.on("stocks", function (event) {
    console.log("received", event);
    const tempStocks = event;
    const tmp = [];
    if (KEY) {
        KEY.innerHTML = "";
        tempStocks.forEach((s, ind) => {
            const split_s = s.split(" - ");
            const child = document.createElement("li");
            child.onclick = () => removeStock(ind);
            child.textContent = s;
            KEY.appendChild(child);
            tmp.push(split_s[0]);
        });
    }
});
socket.on("message", function (event) {
    console.log("receivedMessage", event);
});
let currentChart;
socket.on("stockgraph", function (event) {
    if (HOLDER) {
        HOLDER.innerHTML = "";
        // console.log('stockgraph', event, stocks);
        // const pic = document.createElement("img");
        // pic.classList.add("pic", "center");
        // pic.src = `data:image/png;base64, ${event}`;
        // pic.alt = "stocks";
        // HOLDER.appendChild(pic);
        if (event === "{}") {
            return;
        }
        const orgData = JSON.parse(event);
        const datasets = [];
        stocks.forEach(stock => {
            const dataset = {
                label: stock,
                data: orgData.filter(data => data.code === stock).map(data => data.close),
                fill: false,
                tension: 0.1,
            };
            datasets.push(dataset);
        });
        const labels = [...new Set(orgData.map(data => new Date(data.date).toLocaleDateString()))];
        if (currentChart) {
            currentChart.destroy();
        }
        currentChart = new Chart(HOLDER, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Close Amount ($)',
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Day'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
});
//tie the button to the enter key on the input field
if (STOCK_CODE) {
    STOCK_CODE.addEventListener("keyup", function (ev) {
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

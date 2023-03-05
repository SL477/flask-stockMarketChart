'use strict';
exports.__esModule = true;
var socket_io_1 = require("./socket.io");
var stocks = [];
var socket = socket_io_1.io();
var STOCKCODE = document.getElementById('stockCode');
var KEY = document.getElementById('key');
var HOLDER = document.getElementById('holder');
var BTN = document.getElementById('btn');
function getStockPrices() {
    if (STOCKCODE) {
        var code = STOCKCODE.value;
        if (!code || code === '') {
            alert('Stock code is required');
            return;
        }
        if (stocks.length >= 5) {
            alert('Maximum of 5 stocks to track');
        }
        stocks.push(code.toUpperCase());
        socket.emit('stocksrec', stocks);
        // delete text
        STOCKCODE.value = '';
    }
}
function removeStock(i) {
    socket.emit('removestock', stocks[i]);
}
socket.on('stocks', function (event) {
    console.log('received', event);
    var stks = event;
    var tmp = [];
    if (KEY) {
        KEY.innerHTML = '';
        stks.forEach(function (s, ind) {
            var split_s = s.split(' - ');
            var child = document.createElement('li');
            child.onclick = function () { return removeStock(ind); };
            child.textContent = s;
            KEY.appendChild(child);
            tmp.push(split_s[0]);
        });
    }
});
socket.on('message', function (event) {
    console.log('receivedMessage', event);
});
socket.on('stockgraph', function (event) {
    if (HOLDER) {
        HOLDER.innerHTML = '';
        //console.log('stockgraph', event);
        var pic = document.createElement('img');
        pic.classList.add('pic');
        pic.src = "data:image/png;base64, " + event;
        pic.alt = 'stocks';
        HOLDER.appendChild(pic);
    }
});
//tie the button to the enter key on the input field
if (STOCKCODE) {
    STOCKCODE.addEventListener('keyup', function (evnt) {
        if (evnt.key === 'Enter') {
            evnt.preventDefault();
            if (BTN) {
                BTN.click();
            }
        }
    });
}
if (BTN) {
    BTN.addEventListener('click', getStockPrices);
}

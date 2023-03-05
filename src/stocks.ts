'use strict';

import { io } from './socket.io';

const stocks: string[] = [];
const socket = io();

const STOCKCODE: HTMLSelectElement = document.getElementById('stockCode') as HTMLSelectElement;
const KEY: HTMLUListElement = document.getElementById('key') as HTMLUListElement;
const HOLDER: HTMLDivElement = document.getElementById('holder') as HTMLDivElement;
const BTN: HTMLElement | null = document.getElementById('btn');

function getStockPrices() {
    if (STOCKCODE) {
        const code: string = STOCKCODE.value;
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

function removeStock(i: number) {
    socket.emit('removestock', stocks[i]);
}

socket.on('stocks', function(event) {
    console.log('received', event);
    const stks = event;
    const tmp: string[] = [];
    if (KEY) {
        KEY.innerHTML = '';

        stks.forEach((s: string, ind: number) => {
            const split_s = s.split(' - ');
            const child: HTMLLIElement = document.createElement('li');
            child.onclick = () => removeStock(ind);
            child.textContent = s;
            KEY.appendChild(child);
            tmp.push(split_s[0]);
        });
    }
});

socket.on('message', function(event) {
    console.log('receivedMessage', event);
});

socket.on('stockgraph', function(event) {
    if (HOLDER) {
        HOLDER.innerHTML = '';
        //console.log('stockgraph', event);
        const pic = document.createElement('img');
        pic.classList.add('pic');
        pic.src = `data:image/png;base64, ${event}`;
        pic.alt = 'stocks';
        HOLDER.appendChild(pic);
    }
});

//tie the button to the enter key on the input field
if (STOCKCODE) {
    STOCKCODE.addEventListener('keyup', function(evnt) {
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
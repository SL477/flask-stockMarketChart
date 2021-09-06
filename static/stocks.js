console.log("test");
let stocks = [];
var socket = io();


function getStockPrices() {
    let code = $("#stockCode").val();
    if (!code || code == "") {
        alert("Stock code is required!");
        return;
    }
    if (stocks.length >= 5) {
        alert("Maximum of 5 stocks to track");
        return;
    }
    stocks.push(code.toUpperCase());
    socket.emit("stocksrec", stocks);
}

function removeStock(i) {
    let s = stocks[i];
    socket.emit("removestock", s);
}

socket.on("stocks", function(event) {
    console.log("received", event);
    stocks = event;
    $("#key").empty();
    stocks.forEach((s, ind) => {
        $("#key").append("<li onClick='removeStock(" + ind +")'>" + s + "</li>");
    });
});

socket.on("message", function(event){
    console.log("receivedMessage", event);
});

socket.on("stockgraph", function(event) {
    $("#holder").empty();
    //console.log('stockgraph', event);
    $("#holder").append("<img class='pic' src='data:image/png;base64, " + event + "' alt='stocks'/>");
});
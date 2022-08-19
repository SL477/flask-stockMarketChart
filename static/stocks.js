let stocks = [];
var socket = io();

function getStockPrices() {
    var code = $("#stockCode").val();
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

    // delete text
    $("#stockCode").val("");
}

function removeStock(i) {
    var s = stocks[i];
    socket.emit("removestock", s);
}

socket.on("stocks", function(event) {
    console.log("received", event);
    stks = event;
    tmp = []
    $("#key").empty();
    stks.forEach((s, ind) => {
        var split_s = s.split(' - ');
        $("#key").append("<li onClick='removeStock(" + ind +")'>" + s + "</li>");
        tmp.push(split_s[0]);
    });
    stocks = tmp;
});

socket.on("message", function(event){
    console.log("receivedMessage", event);
});

socket.on("stockgraph", function(event) {
    $("#holder").empty();
    //console.log('stockgraph', event);
    $("#holder").append("<img class='pic' src='data:image/png;base64, " + event + "' alt='stocks'/>");
});

// tie the button to the enter key on the input field
document.getElementById("stockCode").addEventListener("keyup", function(evnt) {
    if (evnt.key == "Enter") {
        evnt.preventDefault();
        document.getElementById("btn").click();
    }
});
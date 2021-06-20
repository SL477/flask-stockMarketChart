console.log("test");
/*const socket = new WebSocket('ws://localhost:5000');
socket.addEventListener('open', function(event) {
    socket.send('test');
});

socket.addEventListener("message", function(event) {
    console.log("Message from server", event.data);
});*/
/*var socket = io.connect("https://localhost:5000");
socket.on("connect", function() {
    console.log("connected");
    socket.emit("connected",{data:''});
});*/
let stocks = [];
var socket = io();
/*socket.on("connect", function() {
    socket.emit("stocks", stocks);
});*/

let dArray = [];
const colors = [
    "red",
    "blue",
    "black",
    "green",
    "yellow"
];

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
    /*$.post("/prices", {stockCode: code}, function(data) {
        console.log(data);
        //visualize(data);
        let dataArray = [];
        Object.keys(data["Time Series (Daily)"]).forEach(element => {
            let d = data["Time Series (Daily)"][element];
            //console.log(d);
            d["date"] = new Date(element);
            d["company"] = data["Meta Data"]["2. Symbol"];
            dataArray.push(d);
        });
        dArray.push(dataArray);
        visualize();
    });*/
    stocks.push(code.toUpperCase());
    socket.emit("stocksrec", stocks);
}

function visualize() {
    const w = 1000;
    const h = 500;
    const padding = 50;

    /*let dataArray = [];
    Object.keys(dataset["Time Series (Daily)"]).forEach(element => {
        let d = dataset["Time Series (Daily)"][element];
        //console.log(d);
        d["date"] = new Date(element);
        d["company"] = dataset["Meta Data"]["2. Symbol"];
        dataArray.push(d);
    });

    console.log(dataArray);
    console.log(dataArray[0].date)*/
    $("#holder").empty();
    $("#key").empty();
    let svg = d3.select("#holder")
            .append("svg")
            .attr("width", w)
            .attr("height", h);
    // Find the min and max y values
    let ymin;
    let ymax;
    dArray.forEach((dataArray, ind) => {
        let min = d3.min(dataArray, d => d["4. close"]);
        let max = d3.max(dataArray, d => d["4. close"]);
        if (!ymin || min < ymin) {
            ymin = min;
        }
        if (!ymax || max > ymax) {
            ymax = max;
        }
        $("#key").append("<li class='" + colors[ind] + "' onClick='removeStock(" + ind +")'>" + dataArray[0]["company"] + "</li>");
    });
    dArray.forEach((dataArray,ind) => {

        let xScale = d3.scaleTime()
            .domain([
                d3.min(dataArray, (d,i) => d.date),
                d3.max(dataArray, (d,i) => d.date)
            ])
            .range([padding, w - padding]);

            //console.log(xScale(dataArray[0].date))
        
        let yScale = d3.scaleLinear()
            .domain([
                ymin,ymax
                //d3.min(dataArray, (d,i) => d["4. close"]),
                //d3.max(dataArray, (d,i) => d["4. close"])
            ])
            .range([h - padding, padding]);

        

        //Tooltip
        /*let tooltip = d3.select("#holder")
            .append("div")
            .style("opacity",0)
            .attr("class", "tooltip")
            .attr("id", "tooltip");*/

        //line
        let valueLine = d3.line()
        .x((d,i) => {/*console.log(xScale(d.date),yScale(d["4. close"]));*/ return xScale(d.date);})
        .y((d,i) => {return yScale(d["4. close"]);})
        .curve(d3.curveLinear);

        svg.append("path")
            .data(dataArray)
            .attr("class", "line")
            .attr("stroke", colors[ind])
            .attr("d", valueLine(dataArray));

        //add the points
        /*svg.selectAll("circle")
            .data(dataArray)
            .enter()
            .append("circle")
            .attr("cx", (d,i) => xScale(d.date))
            .attr("cy", (d,i) => yScale(d["4. close"]))
            .attr("r", 8)
            .attr("class","dot")
            .attr("data-xvalue", (d,i) => {return d.date;})
            .attr("data-yvalue", (d,i) => {return d["4. close"];})
            .style("fill",colors[ind])
        .on("mouseover", (d,i) => {
            //console.log("hi");
            tooltip
                .style("visibility", "visible")
                .style("opacity", 1);
        })
        .on("mousemove", (d, i) => {
            let mouse = d3.mouse(d3.event.currentTarget);
            tooltip
                .html(
                    "date: " + d.date + "<br/>" +
                    "Open: " + d["1. open"] + "<br/>" +
                    "High: " + d["2. high"] + "<br/>" +
                    "Low: " + d["3. low"] + "<br/>" +
                    "Close: " + d["4. close"] + "<br/>" +
                    "Volume: " + d["5. volume"]
                )
                .style("left", (mouse[0] + 70) + "px")
                .style("top", (mouse[1]) + "px");
        })
        .on("mouseleave", (d,i) => {
            tooltip
                .style("visibility", "hidden")
                .style("opacity", 0);
        });*/

        
        
        //Axes
        const xAxis = d3.axisBottom(xScale)//.tickFormat(d3.format("d"));
        svg.append("g")
            .attr("transform", "translate(0, " + (h - padding) + ")")
            .attr("id", "x-axis")
            .call(xAxis);
        
        const yAxis = d3.axisLeft(yScale);
        svg.append("g")
            .attr("transform", "translate(" + padding + ",0)")
            .attr("id","y-axis")
            .call(yAxis);

        //Labels
        //X Label
        d3.select("svg")
            .append("text")
            .attr("class", "xlabel")
            .attr("text-anchor","end")
            .attr("text-align", "center")
            .attr("x", w / 2)
            .attr("y", h - 6)
            .text("Day");
        
        //Y Label
        d3.select("svg")
            .append("text")
            .attr("class","yLabel")
            .attr("text-anchor", "end")
            .style("text-align", "end")
            .attr("y", 6)
            .attr("dy", ".75em")
            .attr("x", -200)
            .attr("transform", "rotate(-90)")
            .text("Close Amount ($)");
    });
}

function removeStock(i) {
    let s = dArray[i][0]["company"];
    dArray.splice(i,1);
    console.log(dArray);
    socket.emit("removestock", s);
    //visualize();
}

socket.on("stocks", function(event) {
    //socket.emit("stocks", {data: 'ABC'});
    console.log("received", event);
    stocks = event;
    dArray = [];
    stocks.forEach(s => {
        $.post("/prices", {stockCode: s}, function(data) {
            console.log(data);
            //visualize(data);
            let dataArray = [];
            Object.keys(data["Time Series (Daily)"]).forEach(element => {
                let d = data["Time Series (Daily)"][element];
                //console.log(d);
                d["date"] = new Date(element);
                d["company"] = data["Meta Data"]["2. Symbol"];
                dataArray.push(d);
            });
            dArray.push(dataArray);
            visualize();
        });
    });
});

socket.on("message", function(event){
    console.log("receivedMessage", event);
});

$( document ).ready(function() {
    //visualize(dummyData);
   // console.log(Object.keys(dummyData["Time Series (Daily)"]));
   visualize();
});
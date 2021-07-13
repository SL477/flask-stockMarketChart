from flask import Flask, redirect, url_for, request
from key import apikey
import requests
from flask_socketio import SocketIO, send, emit
from getStocksGraph import GetStocksGraph

'''
apikey function (hidden by GitIgnore)
def apikey():
    
    Return the api key
    
    return "[MyKey]"
'''

app = Flask(__name__)

# Hold everyones stocks
stocks = []

@app.route("/")
def index():
    return redirect(url_for('static', filename="index.html"))

@app.route("/myStyle.css")
def style():
    return redirect(url_for("static", filename="myStyle.css"))

@app.route("/stocks.js")
def stonks():
    return redirect(url_for("static", filename="stocks.js"))

@app.route("/prices", methods=["POST"])
def getPrices():
    """
    Get the prices from alphavantage
    """
    stockCode = str(request.form.get("stockCode"))
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={stockCode}&apikey={apikey()}"
    r = requests.get(url)
    return r.json()

socketio = SocketIO(app)

def getStocks():
    """
    Emit the list of stocks to all of the receivers, plus the graph
    """
    global stocks
    emit("stocks", stocks, broadcast=True)
    emit("stockgraph", GetStocksGraph(stocks).decode("utf-8"), broadcast=True)
    print("emitted stocks")

@socketio.on('message')
def handle_message(data):
    print("received message: " + data)
    #emit('stocks', getStocks())
    getStocks()

@socketio.on("connect")
def test(data=""):
    """
    When the items connect emit the current list of stocks
    """
    #emit("stocks", getStocks())
    getStocks()

@socketio.on("stocksrec")
def receivedStocks(data):
    """
    Received a stock from the JavaScript App
    """
    for stock in data:
        print("Received message: " + stock)
        global stocks
        if stock not in stocks:
            if len(stocks) < 5:
                stocks.append(stock)
    getStocks()
    
@socketio.on("removestock")
def removeStock(data):
    """
    Remove a stock from the list
    """
    global stocks
    stocks.remove(data)
    getStocks()

if __name__ == "__main__":
    #app.run()
    socketio.run(app, host = "0.0.0.0")
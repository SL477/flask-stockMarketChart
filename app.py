from flask import Flask, request, render_template
from flask_socketio import SocketIO, emit
from getStocksGraph import GetStocksGraph, getPricesForStock
from get_tickers import get_tickers
from dotenv import load_dotenv
import os

app = Flask(__name__, static_url_path='')
_ = load_dotenv()
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', '')

# Hold everyones stocks
stocks = []

# get the data for the stock market names and tickers
stock_symbols_name = get_tickers()


@app.route("/")
def index():
    return render_template("index.html", stock_symbols_name=stock_symbols_name)


@app.route("/prices", methods=["POST"])
def getPrices():
    """Get the prices from alphavantage"""
    stockCode = str(request.form.get("stockCode"))
    return getPricesForStock(stockCode)


socketio = SocketIO(app)


def getStocks():
    """Emit the list of stocks to all of the receivers, plus the graph"""
    global stocks
    # get the names of the stocks to send back
    dict_stocks: dict = dict(stock_symbols_name)
    stks = [f"{x} - {dict_stocks.get(x, x)}" for x in stocks]

    emit("stocks", stks, broadcast=True)
    emit("stockgraph", GetStocksGraph(
        stocks, dict_stocks).decode("utf-8"), broadcast=True)
    print("emitted stocks")


@socketio.on('message')
def handle_message(data):
    print("received message: " + data)
    # emit('stocks', getStocks())
    getStocks()


@socketio.on("connect")
def test(data=""):
    """When the items connect emit the current list of stocks"""
    # emit("stocks", getStocks())
    getStocks()


@socketio.on("stocksrec")
def receivedStocks(data):
    """Received a stock from the JavaScript App"""
    for stock in data:
        print("Received message: " + stock)
        global stocks
        if stock not in stocks:
            if len(stocks) < 5:
                stocks.append(stock)
    getStocks()


@socketio.on("removestock")
def removeStock(data):
    """Remove a stock from the list"""
    global stocks
    if data in stocks:
        stocks.remove(data)
        getStocks()


if __name__ == "__main__":
    # app.run()
    socketio.run(app, host="0.0.0.0", port=os.environ.get('PORT', '5000'))

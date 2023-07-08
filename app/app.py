from flask import Flask, redirect, url_for
from flask_socketio import SocketIO, emit
from .getStocksGraph import GetStocksGraph
from .get_tickers import get_tickers
from dotenv import load_dotenv
import os


app = Flask(__name__, static_url_path='')
_ = load_dotenv()
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', '')

# Hold everyone's stocks
stocks = []

# get the data for the stock market names and tickers
stock_symbols_name = get_tickers()


@app.route("/")
def index():
    return redirect(url_for('static', filename='index.html'))


socketio = SocketIO(app)


def getStocks():
    """Emit the list of stocks to all of the receivers, plus the graph"""
    global stocks
    # get the names of the stocks to send back
    dict_stocks: dict = dict(stock_symbols_name)
    stocks_temp = [f"{x} - {dict_stocks.get(x, x)}" for x in stocks]

    emit("stocks", stocks_temp, broadcast=True)
    emit("stockGraph", GetStocksGraph(stocks), broadcast=True)
    print("emitted stocks")


@socketio.on('message')
def handle_message(data):
    print("received message: " + data)
    getStocks()


@socketio.on("connect")
def test(data=""):
    """When the items connect emit the current list of stocks"""
    getStocks()


@socketio.on("stocksReceived")
def receivedStocks(data):
    """Received a stock from the JavaScript App"""
    for stock in data:
        print("Received message: " + stock)
        global stocks
        if stock not in stocks:
            if len(stocks) < 5:
                stocks.append(stock)
    getStocks()


@socketio.on("removeStock")
def removeStock(data):
    """Remove a stock from the list"""
    global stocks
    if data in stocks:
        stocks.remove(data)
        getStocks()


@socketio.on("getTickers")
def sendStockTickers():
    print("sendingTickers")
    emit("stockTickers", str(stock_symbols_name))

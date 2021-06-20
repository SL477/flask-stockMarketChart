from flask import Flask, redirect, url_for, request
from key import apikey
import requests
from flask_socketio import SocketIO, send, emit

'''
apikey function (hidden by GitIgnore)
def apikey():
    
    Return the api key
    
    return "[MyKey]"
'''

app = Flask(__name__)

@app.route("/")
def index():
    return redirect(url_for('static', filename="index.html"))

@app.route("/myStyle.css")
def style():
    return redirect(url_for("static", filename="myStyle.css"))

@app.route("/stocks.js")
def stocks():
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
    return ["IBM"]

@socketio.on('message')
def handle_message(data):
    print("received message: " + data)
    emit('stocks', getStocks())

@socketio.on("connect")
def test():
    emit("stocks", getStocks())

@socketio.on("stocks")
def receivedStocks(data):
    for stock in data:
        print("Received message: " + stock)
    

if __name__ == "__main__":
    #app.run()
    socketio.run(app, host = "0.0.0.0")
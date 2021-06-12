from flask import Flask, redirect, url_for
from key import apikey

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

if __name__ == "__main__":
    app.run()
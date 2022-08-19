from key import apikey
import pandas as pd

def get_tickers() -> list:
    """This is to get the lists of stock market tickers for the Stock market charter.
    Stock_symbols and then stock_names"""
    url = f"https://www.alphavantage.co/query?function=LISTING_STATUS&apikey={apikey()}"

    df = pd.read_csv(url)

    stock_symbols = df['symbol'].to_list()
    stock_name = df['name'].to_list()
    return list(zip(stock_symbols, stock_name))
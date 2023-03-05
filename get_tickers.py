import os
import pandas as pd


def get_tickers() -> list:
    """This is to get the lists of stock market tickers for the Stock market
    charter. Stock_symbols and then stock_names"""
    url = "https://www.alphavantage.co/query?function=LISTING_STATUS&apikey="
    url += os.environ.get('KEY', '')
    df: pd.DataFrame = pd.read_csv(url)
    df.sort_values(['name', 'symbol'], inplace=True)

    stock_symbols = df['symbol'].to_list()
    stock_name = df['name'].to_list()
    return list(zip(stock_symbols, stock_name))

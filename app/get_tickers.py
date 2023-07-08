import os
import pandas as pd


def get_tickers() -> list:
    """This is to get the lists of stock market tickers for the Stock market
    charter. Stock_symbols and then stock_names

    Returns
    -------
    list
        of tuples with (code, description)"""
    url = "https://www.alphavantage.co/query?function=LISTING_STATUS&apikey="
    url += os.environ.get('KEY', '')
    df: pd.DataFrame = pd.read_csv(url)
    df.sort_values(['name', 'symbol'], inplace=True)

    # stock_symbols = df['symbol'].to_list()
    # stock_name = df['name'].fillna('').to_list()
    # return list(zip(stock_symbols, stock_name))

    df = df[['symbol', 'name']]
    df = df[df['symbol'].notnull()]
    df['name'].fillna('', inplace=True)
    df['name'] = df['name'].str.replace("'", "")
    return list(df.itertuples(index=False, name=None))

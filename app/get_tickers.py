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
    if df.empty:
        print('[get_tickers] empty dataframe - ', os.environ.get('KEY', ''), flush=True)
        return []

    df.sort_values(['name', 'symbol'], inplace=True)

    df = df[['symbol', 'name']]
    df = df[df['symbol'].notnull()]
    df['name'].fillna('', inplace=True)
    df['name'] = df['name'].str.replace("'", "")
    return list(df.itertuples(index=False, name=None))

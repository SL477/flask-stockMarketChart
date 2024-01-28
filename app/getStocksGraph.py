# This is to get the stocks graph
import pandas as pd
import requests
import os


def getPricesForStock(stock: str) -> dict:
    """Get the prices from AlphaVantage"""
    # u = 'https://www.alphavantage.co/query'
    # u += '?function=TIME_SERIES_DAILY_ADJUSTED&symbol='
    u = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='
    u += f"{stock}&apikey={os.environ.get('KEY', '')}"
    r = requests.get(u)
    return r.json()


def ConvertJsonToDataFrame(data: dict) -> pd.DataFrame:
    """Put in the json from the GetPrices API and return a dataframe of the
    clean data"""
    try:
        df = pd.DataFrame.from_dict(data['Time Series (Daily)'])
        df = df.transpose()
        df = df.sort_index()
        df = df.rename(columns={
            '1. open': 'open',
            '2. high': 'high',
            '3. low': 'low',
            '4. close': 'close',
            '5. volume': 'volume'})
            # # '5. adjusted close': 'adjustedClose',
            # '6. volume': 'volume',
            # '7. dividend amount': 'dividend',
            # '8. split coefficient': 'splitCoefficient'})
        df['close'] = df['close'].astype(float)
        df['open'] = df['open'].astype(float)
        df['high'] = df['high'].astype(float)
        df['low'] = df['low'].astype(float)
        df['volume'] = df['volume'].astype(int)
        # df['adjustedClose'] = df['adjustedClose'].astype(float)
        # df['dividend'] = df['dividend'].astype(float)
        # df['splitCoefficient'] = df['splitCoefficient'].astype(float)
        df['date'] = df.index
        return df
    except Exception as e:
        print('data', data, 'Exception:', e)


def GetStocksGraph(stocks_list: list) -> str:
    """Send in a list of stocks and get a graph out"""
    df = None
    rmv_list = []
    for idx, s in enumerate(stocks_list):
        if df is None:
            df = ConvertJsonToDataFrame(getPricesForStock(s))
            if df is not None:
                df['code'] = s
            else:
                rmv_list.append(idx)
        else:
            sdf = ConvertJsonToDataFrame(getPricesForStock(s))
            if sdf is not None:
                sdf['code'] = s
                df = pd.concat([df, sdf])
            else:
                rmv_list.append(idx)
    # remove invalid stocks
    for idx in reversed(rmv_list):
        stocks_list.pop(idx)

    if df is None:
        return "{}"
    return df.to_json(orient='records')


if __name__ == '__main__':
    print(GetStocksGraph(['IBM', 'TSLA']))

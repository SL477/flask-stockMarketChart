# This is to get the stocks graph
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import io
import base64
import requests
import os


def getPricesForStock(stock: str) -> dict:
    """Get the prices from alphavantage"""
    u = 'https://www.alphavantage.co/query'
    u += '?function=TIME_SERIES_DAILY_ADJUSTED&symbol='
    u += f"{stock}&apikey={os.environ.get('KEY', '')}"
    r = requests.get(u)
    return r.json()


def ConvertJsonToDataFrame(data: dict) -> pd.DataFrame:
    """Put in the json from the GetPrices API and return a dataframe of the
    clean data"""
    try:
        df = pd.DataFrame.from_dict(data['Time Series (Daily)'])
        df = df.transpose()
        # df.index = pd.to_datetime(df.index)
        df = df.sort_index()
        df = df.rename(columns={
            '1. open': 'open',
            '2. high': 'high',
            '3. low': 'low',
            '4. close': 'close',
            '5. adjusted close': 'adjustedClose',
            '6. volume': 'volume',
            '7. dividend amount': 'dividend',
            '8. split coefficient': 'splitCoefficient'})
        df['close'] = df['close'].astype(float)
        df['open'] = df['open'].astype(float)
        df['high'] = df['high'].astype(float)
        df['low'] = df['low'].astype(float)
        df['volume'] = df['volume'].astype(int)
        df['date'] = df.index
        return df
    except Exception as e:
        print('data', data, 'Exception:', e)


def GetStocksGraph(stocks_list: list, stock_labels: dict) -> str:
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
                # df = df.append(sdf)
                df = pd.concat([df, sdf])
            else:
                rmv_list.append(idx)
    # remove invalid stocks
    for idx in reversed(rmv_list):
        stocks_list.pop(idx)
    # plt.clf()
    # plt.figure(figsize=(15, 8))
    # if df is None:
    #     y_min = 0
    #     y_max = 1000
    # else:
    #     y_min = np.min(df['close'])
    #     y_max = np.max(df['close'])

    #     for code in df['code'].unique():
    #         temp = df[df['code'] == code]
    #         plt.plot(
    #             temp.index,
    #             temp['close'],
    #             label=f"{code} - {stock_labels.get(code, code)}")
    #     # print(code, np.max(temp['close']))
    #     plt.legend()
    # myFmt = mdates.DateFormatter('%b-%y')
    # plt.gca().xaxis.set_major_formatter(myFmt)
    # plt.ylabel('Close Amount ($)')
    # plt.xlabel('Day')
    # plt.gca().xaxis.set_minor_locator(mdates.DayLocator())
    # plt.ylim(top=y_max, bottom=y_min)
    # # plt.show()
    # stringIObytes = io.BytesIO()
    # plt.savefig(stringIObytes, format='jpg')
    # stringIObytes.seek(0)
    # ret = base64.b64encode(stringIObytes.read())
    # plt.close()
    # return ret
    if df is None:
        return "{}"
    return df.to_json(orient='records')


if __name__ == '__main__':
    print(GetStocksGraph(['IBM', 'TSLA']))

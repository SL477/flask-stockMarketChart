# This is to get the stocks graph
from key import apikey
import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import io
import base64

def GetPrices(stock: str) -> str:
    """This is to get the data from Alpha Vantage"""
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={stock}&apikey={apikey()}"
    r = requests.get(url)
    return r.json()

def ConvertJsonToDataFrame(data: str) -> pd.DataFrame:
    """Put in the json from the GetPrices API and return a dataframe of the clean data"""
    try:
        df = pd.DataFrame.from_dict(data['Time Series (Daily)'])
        df = df.transpose()
        df.index = pd.to_datetime(df.index)
        df = df.sort_index()
        df = df.rename(columns={'1. open': 'open', '2. high': 'high', '3. low': 'low', '4. close': 'close', '5. volume': 'volume'})
        df['close'] = df['close'].astype(float)
        df['open'] = df['open'].astype(float)
        df['high'] = df['high'].astype(float)
        df['low'] = df['low'].astype(float)
        df['volume'] = df['volume'].astype(int)
        return df
    except:
        print('data',data)

def GetStocksGraph(stocks_list: list) -> str:
    """Send in a list of stocks and get a graph out"""
    df = None
    rmv_list = []
    for idx, s in enumerate(stocks_list):
        if df is None:
            df = ConvertJsonToDataFrame(GetPrices(s))
            if df is not None:
                df['code'] = s
            else:
                rmv_list.append(idx)
        else:
            sdf = ConvertJsonToDataFrame(GetPrices(s))
            if sdf is not None:
                sdf['code'] = s
                df = df.append(sdf)
            else:
                rmv_list.append(idx)
    # remove invalid stocks
    for idx in reversed(rmv_list):
        stocks_list.pop(idx)
    plt.clf()
    plt.figure(figsize=(15,8))
    if df is None:
        y_min = 0
        y_max = 1000
    else:
        y_min = np.min(df['close'])
        y_max = np.max(df['close'])
        
        for code in df['code'].unique():
            temp = df[df['code'] == code]
            plt.plot(temp.index, temp['close'], label=code)
        #print(code, np.max(temp['close']))
        plt.legend()
    myFmt = mdates.DateFormatter('%b-%y')
    plt.gca().xaxis.set_major_formatter(myFmt)
    plt.ylabel('Close Amount ($)')
    plt.xlabel('Day')
    plt.gca().xaxis.set_minor_locator(mdates.DayLocator())
    plt.ylim(top=y_max, bottom=y_min)
    #plt.show()
    stringIObytes = io.BytesIO()
    plt.savefig(stringIObytes, format='jpg')
    stringIObytes.seek(0)
    return base64.b64encode(stringIObytes.read())

if __name__ == '__main__':
    print(GetStocksGraph(['IBM','TSLA']))
    #GetStocksGraph(['IBM','TSLA'])
# This is to get the stocks graph
from key import apikey
import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

def GetPrices(stock):
    '''
    This is to get the data from Alpha Vantage
    '''
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={stock}&apikey={apikey()}"
    r = requests.get(url)
    return r.json()

def ConvertJsonToDataFrame(data):
    '''
    Put in the json from the GetPrices API and return a dataframe of the clean data
    '''
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

def GetStocksGraph(stocks_list):
    '''
    Send in a list of stocks and get a graph out
    '''
    df = None
    for s in stocks_list:
        if df is None:
            df = ConvertJsonToDataFrame(GetPrices(s))
            df['code'] = s
        else:
            sdf = ConvertJsonToDataFrame(GetPrices(s))
            sdf['code'] = s
            df = df.append(sdf)
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
    plt.show()
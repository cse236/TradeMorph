import yfinance as yf
import pandas as pd
import os

STOCKS = [
    "RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS","ICICIBANK.NS",
    "SBIN.NS","YESBANK.NS","ADANIENT.NS","PAYTM.NS","ZOMATO.NS",
    "IRCTC.NS","TATAMOTORS.NS","TATASTEEL.NS",
    "AAPL","MSFT","GOOGL","AMZN","TSLA","NVDA","META",
    "COIN","PLTR","RIVN","PYPL","SPY","QQQ"
]

os.makedirs("data/raw", exist_ok=True)

for stock in STOCKS:
    print(f"Downloading {stock}...")
    df = yf.download(stock, period="5y")

    if df.empty:
        continue

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[0] for c in df.columns]

    df.to_csv(f"data/raw/{stock.replace('.', '_')}.csv")

print("✅ All stock data downloaded")

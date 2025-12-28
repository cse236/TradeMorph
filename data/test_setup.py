import yfinance as yf

data = yf.download("TCS.NS", period="5d")
print(data.head())

import sys
import os
import json
import warnings
import requests # REQUIRED: pip install requests
import numpy as np
import joblib
import pandas as pd
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta, timezone

# --- 1. SILENCE WARNINGS ---
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'trained_models')

if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

def get_model_path(symbol):
    return os.path.join(MODELS_DIR, f"{symbol}.pkl")

def get_ist_time(timestamp=None):
    ist_offset = timedelta(hours=5, minutes=30)
    if timestamp:
        dt_utc = datetime.fromtimestamp(timestamp, timezone.utc)
        dt_ist = dt_utc + ist_offset
    else:
        dt_ist = datetime.now(timezone.utc) + ist_offset
    return dt_ist.strftime("%d %b %Y, %I:%M %p")

# --- DATA PREP ---
def prepare_data(df):
    if len(df) < 5: return df 
    
    # FIX: Robust Column Flattening for yfinance 0.2+
    if isinstance(df.columns, pd.MultiIndex):
        try:
            # If columns are like ('Close', 'AAPL'), drop the ticker level
            df.columns = df.columns.get_level_values(0)
        except IndexError:
            pass

    # Ensure we strictly have the column names we need
    # (Sometimes yfinance returns 'Adj Close' instead of 'Close')
    if 'Close' not in df.columns and 'Adj Close' in df.columns:
        df['Close'] = df['Adj Close']

    # Calculate Indicators
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    rs = rs.fillna(0)
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # Dynamic SMA 
    if len(df) > 60:
        df['SMA'] = df['Close'].rolling(window=50).mean()
    else:
        df['SMA'] = df['Close'].rolling(window=10).mean()

    df['Volatility'] = df['Close'].rolling(window=5).std()
    df['Target'] = df['Close'].shift(-1)
    
    # Fill NaNs
    df['RSI'] = df['RSI'].fillna(50)
    df['SMA'] = df['SMA'].fillna(df['Close'])
    df['Volatility'] = df['Volatility'].fillna(0)
    
    df.dropna(subset=['Target'], inplace=True)
    return df

# --- DOWNLOADER (ANTI-BLOCK VERSION) ---
def get_stock_data(symbol):
    # Auto-add .NS for Indian stocks
    if "." not in symbol and symbol not in ["AAPL", "TSLA", "BTC-USD"]:
        symbol += ".NS"

    # Define a session to mock a browser (Fixes "Delisted" error)
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })

    with HiddenPrints():
        try:
            # Try fetching with Ticker + Session (Most reliable)
            ticker = yf.Ticker(symbol, session=session)
            df = ticker.history(period="2y", auto_adjust=True)
            
            if df.empty:
                # Fallback to standard download if history fails
                df = yf.download(symbol, period="2y", progress=False, auto_adjust=True)
                
        except Exception:
            # Last ditch attempt
            df = yf.download(symbol, period="2y", progress=False, auto_adjust=True)
    
    return df, symbol

# --- TRAIN ENGINE ---
def train_and_save_model(symbol):
    df, real_symbol = get_stock_data(symbol)
    
    if df.empty:
        raise Exception(f"No data found for {symbol}")
    
    if len(df) < 15:
        raise Exception(f"Stock {real_symbol} is too new (insufficient data)")

    df = prepare_data(df)
    features = ['Close', 'RSI', 'SMA', 'Volatility']
    
    # Final check before training
    if 'SMA' not in df.columns:
         raise Exception(f"Indicator calculation failed for {real_symbol}")

    X = df[features]
    y = df['Target']

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    joblib.dump(model, get_model_path(real_symbol))
    return model, real_symbol

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    try:
        if len(sys.argv) < 2: raise Exception("No symbol provided")
        symbol = sys.argv[1].upper().strip()
        force_retrain = len(sys.argv) > 2 and sys.argv[2] == "train"

        # 1. Resolve Name
        if "." not in symbol and symbol not in ["AAPL", "TSLA", "BTC-USD"]:
            symbol += ".NS"
            
        model_path = get_model_path(symbol)
        
        # 2. Train or Load
        if force_retrain or not os.path.exists(model_path):
            model, symbol = train_and_save_model(symbol)
            status_msg = "Freshly Trained"
            last_trained_str = get_ist_time()
        else:
            try:
                model = joblib.load(model_path)
                status_msg = "Cached Model"
                last_trained_str = get_ist_time(os.path.getmtime(model_path))
            except:
                model, symbol = train_and_save_model(symbol)
                status_msg = "Retrained (Error)"
                last_trained_str = get_ist_time()

        # 3. Predict
        # Use the same robust downloader logic for prediction data
        df_live, _ = get_stock_data(symbol)
        
        # We only need the last 1 year for prediction context
        recent_df = df_live.tail(252).copy() if len(df_live) > 252 else df_live

        if recent_df.empty: raise Exception("Live data fetch failed")

        recent_df = prepare_data(recent_df)
        features = ['Close', 'RSI', 'SMA', 'Volatility']
        
        last_row = recent_df.iloc[[-1]][features]
        
        # 4. Generate Output (With Explicit Type Casting)
        prediction_raw = model.predict(last_row)[0]
        prediction = float(prediction_raw)
        
        current_price_raw = recent_df['Close'].iloc[-1]
        current_price = float(current_price_raw)
        
        signal = "BUY" if prediction > current_price else "SELL"
        
        vol_raw = recent_df['Volatility'].iloc[-1]
        vol = float(vol_raw)
        confidence = max(0, min(100, 100 - (vol / current_price * 1000)))

        chart_data = []
        for date, row in recent_df.tail(30).iterrows():
            chart_data.append({
                "date": date.strftime('%d %b'),
                "price": round(float(row['Close']), 2)
            })
        chart_data.append({"date": "FORECAST", "price": round(prediction, 2)})

        # 5. Print JSON
        print(json.dumps({
            "symbol": symbol,
            "current_price": round(current_price, 2),
            "prediction": round(prediction, 2),
            "signal": signal,
            "confidence": round(confidence, 2),
            "status": status_msg,
            "last_trained": last_trained_str,
            "history": chart_data
        }))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
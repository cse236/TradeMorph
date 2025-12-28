import pandas as pd
import glob
import os

RAW_DIR = "data/raw"
FEATURE_DIR = "data/features"

os.makedirs(FEATURE_DIR, exist_ok=True)

files = glob.glob(f"{RAW_DIR}/*.csv")

for file in files:
    df = pd.read_csv(file)

    # Skip empty or broken files
    if df.empty or "Close" not in df.columns:
        continue

    df["daily_return"] = df["Close"].pct_change()
    df["volatility"] = df["daily_return"].rolling(5).std()
    df["avg_volume"] = df["Volume"].rolling(10).mean()
    df["volume_spike"] = df["Volume"] / df["avg_volume"]

    df.dropna(inplace=True)

    filename = os.path.basename(file)
    df.to_csv(f"{FEATURE_DIR}/{filename}", index=False)

print("✅ Feature extraction completed for all stocks")

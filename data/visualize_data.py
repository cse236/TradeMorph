import pandas as pd
import matplotlib.pyplot as plt

# Read CSV, skipping metadata rows
df = pd.read_csv("tcs_2y.csv", skiprows=[1, 2])

# Rename first column to Date
df.rename(columns={df.columns[0]: "Date"}, inplace=True)

# Convert Date column to datetime
df["Date"] = pd.to_datetime(df["Date"])

# Set Date as index
df.set_index("Date", inplace=True)

# Convert remaining columns to numeric
for col in df.columns:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# -------- Plot Closing Price --------
plt.figure(figsize=(12, 5))
plt.plot(df.index, df["Close"])
plt.title("TCS Closing Price (2 Years)")
plt.xlabel("Date")
plt.ylabel("Price")
plt.show()

# -------- Plot Volume --------
plt.figure(figsize=(12, 5))
plt.bar(df.index, df["Volume"])
plt.title("TCS Trading Volume (2 Years)")
plt.xlabel("Date")
plt.ylabel("Volume")
plt.show()

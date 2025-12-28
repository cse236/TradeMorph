import pandas as pd
import matplotlib.pyplot as plt

# Load labeled data
df = pd.read_csv("tcs_2y_labeled.csv")

# Convert Date
df["Date"] = pd.to_datetime(df["Date"])
df.set_index("Date", inplace=True)

# Separate panic points
panic = df[df["behavior_label"] == "PANIC_SELL"]
fomo = df[df["behavior_label"] == "FOMO_BUY"]

# Plot price
plt.figure(figsize=(12,5))
plt.plot(df.index, df["Close"], label="Close Price", alpha=0.7)

# Overlay panic & fomo
plt.scatter(panic.index, panic["Close"], color="red", label="Panic Sell", s=50)
plt.scatter(fomo.index, fomo["Close"], color="green", label="FOMO Buy", s=50)

plt.title("TCS Price with Behavioural Events")
plt.xlabel("Date")
plt.ylabel("Price")
plt.legend()
plt.show()

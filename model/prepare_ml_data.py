import pandas as pd

# Load labeled data
df = pd.read_csv("../data/tcs_2y_labeled.csv")

# Select features & label
features = [
    "daily_return",
    "volatility",
    "volume_spike"
]

X = df[features]
y = df["behavior_label"]

# Drop rows with NaN
mask = X.notnull().all(axis=1)
X = X[mask]
y = y[mask]

print("Feature shape:", X.shape)
print("Label distribution:")
print(y.value_counts())

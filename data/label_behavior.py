import pandas as pd
import glob
import numpy as np
import os

FEATURE_DIR = "data/features"
OUTPUT_FILE = "data/final_behavior_dataset.csv"

files = glob.glob(f"{FEATURE_DIR}/*.csv")
rows = []

for file in files:
    df = pd.read_csv(file)

    # Skip broken files
    if df.empty:
        continue

    for _, row in df.iterrows():
        action = np.random.choice(["BUY", "SELL"], p=[0.5, 0.5])

        label = "NORMAL"

        # ---- BEHAVIOR RULES ----
        if (
            action == "BUY"
            and row["daily_return"] > 0.02
            and row["volume_spike"] > 1.3
        ):
            label = "FOMO_BUY"

        elif (
            action == "SELL"
            and row["daily_return"] < -0.02
            and row["volatility"] > 0.015
        ):
            label = "PANIC_SELL"

        rows.append({
            "daily_return": row["daily_return"],
            "volatility": row["volatility"],
            "volume_spike": row["volume_spike"],
            "action": 1 if action == "BUY" else 0,
            "behavior": label
        })

final_df = pd.DataFrame(rows)
final_df.dropna(inplace=True)

final_df.to_csv(OUTPUT_FILE, index=False)

print("\n✅ Behavior labeling completed")
print("Dataset size:", len(final_df))
print("\nBehavior distribution:")
print(final_df["behavior"].value_counts())

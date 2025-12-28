import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# Load data
df = pd.read_csv("../data/tcs_2y_labeled.csv")

features = ["daily_return", "volatility", "volume_spike"]
X = df[features]
y = df["behavior_label"]

mask = X.notnull().all(axis=1)
X = X[mask]
y = y[mask]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.3,
    random_state=42,
    stratify=y
)

model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)

model.fit(X_train, y_train)

# Save model
joblib.dump(model, "behavior_model.pkl")

# Example confidence output
probs = model.predict_proba(X_test)
classes = model.classes_

example = X_test.iloc[0]
example_probs = dict(zip(classes, probs[0]))

print("Example input:")
print(example)
print("\nPredicted probabilities:")
print(example_probs)

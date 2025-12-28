import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

# Load dataset
df = pd.read_csv("data/final_behavior_dataset.csv")

X = df[["daily_return", "volatility", "volume_spike"]]
y = df["behavior"]

# Stratified split (important)
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.25,
    random_state=42,
    stratify=y
)

# Pipeline = scaling + balanced model
model = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(
        max_iter=1500,
        class_weight="balanced",
        n_jobs=-1
    ))
])

model.fit(X_train, y_train)

# Evaluation
y_pred = model.predict(X_test)

print("\n📊 Classification Report:\n")
print(classification_report(y_test, y_pred))

# Save model
joblib.dump(model, "model/behavior_model.pkl")
print("\n✅ Final behavior model saved")

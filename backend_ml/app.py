from flask import Flask, request, jsonify
import joblib
import yfinance as yf
import pandas as pd
import os

# ----------------- Flask App -----------------
app = Flask(__name__)

# ----------------- Load ML Model -----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "behavior_model.pkl")

model = joblib.load(MODEL_PATH)

FEATURE_COLUMNS = ["daily_return", "volatility", "volume_spike"]

# ----------------- Feature Computation -----------------
def compute_features(stock_symbol):
    # Download recent data
    data = yf.download(stock_symbol, period="6mo", progress=False)

    # Handle yfinance MultiIndex columns
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = [col[0] for col in data.columns]

    # Ensure required columns exist
    required_cols = ["Close", "Volume"]
    if not all(col in data.columns for col in required_cols):
        raise ValueError("Required market data not available")

    close = data["Close"].astype(float)
    volume = data["Volume"].astype(float)

    # Feature engineering
    daily_return = close.pct_change()
    volatility = daily_return.rolling(window=5).std()
    avg_volume = volume.rolling(window=5).mean()
    volume_spike = volume / avg_volume

    # Create single-row DataFrame for model
    features = pd.DataFrame([{
        "daily_return": daily_return.iloc[-1],
        "volatility": volatility.iloc[-1],
        "volume_spike": volume_spike.iloc[-1]
    }])

    return features

# ----------------- API Endpoint -----------------
@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        payload = request.get_json()
        stock = payload.get("stock")

        if not stock:
            return jsonify({"error": "Stock symbol is required"}), 400

        features = compute_features(stock)

        probabilities = model.predict_proba(features)[0]
        classes = model.classes_

        response = dict(zip(classes, probabilities))
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------- Run Server -----------------
if __name__ == "__main__":
    app.run(port=5001,debug=True)

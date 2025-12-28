import { useState } from "react";
import axios from "axios";

export default function MarketBehaviorWidget() {
  const [stock, setStock] = useState("TCS.NS");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeAction = async (action) => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await axios.post(
        "http://localhost:5000/api/ml/analyze-stock",
        { stock, action }
      );

      setResult(res.data);
    } catch (err) {
      setError("Behavior analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", marginTop: "20px" }}>
      <h3>🧠 Trade Behavior Check</h3>

      <input
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        placeholder="Stock symbol (e.g. TCS.NS)"
        style={{ marginRight: "10px" }}
      />

      <button onClick={() => analyzeAction("BUY")} disabled={loading}>
        BUY
      </button>

      <button
        onClick={() => analyzeAction("SELL")}
        disabled={loading}
        style={{ marginLeft: "10px" }}
      >
        SELL
      </button>

      {loading && <p>Analyzing behavior...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "10px" }}>
          {result.allowOrder ? (
            <p style={{ color: "green" }}>
              ✅ No risky behavior detected. You may proceed.
            </p>
          ) : (
            <p style={{ color: "red" }}>
              ⚠️ {result.warning.message}
            </p>
          )}

          <hr />

          <p>🟠 FOMO BUY: {(result.confidence.FOMO_BUY * 100).toFixed(1)}%</p>
          <p>🟢 NORMAL: {(result.confidence.NORMAL * 100).toFixed(1)}%</p>
          <p>🔴 PANIC SELL: {(result.confidence.PANIC_SELL * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import axios from "axios";
import "../CSS/TradeUpload.css";

export default function TradeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tradeData, setTradeData] = useState([]);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload CSV to backend
  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTradeData(res.data.trades); // backend returns parsed CSV rows
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Simulate "Proceed to Analysis"
  const handleProceed = () => {
    alert("Proceeding to analysis..."); // replace with navigation or chart rendering
  };

  return (
    <div className="trade-upload-page">
      <h2>Upload Your Trade Data</h2>

      <div className="upload-section">
        <div className="upload-box">
          <div className="drag-drop">
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <p>Drag & Drop your CSV file here or</p>
          </div>
          <button onClick={handleUpload} className="proceed-btn">Upload CSV</button>
        </div>

        <div className="analysis-box">
          {loading ? (
            <div className="loading-circle">
              <div className="spinner"></div>
              <p>Analyzing your data...</p>
            </div>
          ) : (
            <p>Ready for analysis</p>
          )}
        </div>
      </div>

      {tradeData.length > 0 && (
        <table className="trade-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Entry Price</th>
              <th>Exit Price</th>
              <th>Quantity</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {tradeData.map((row, index) => (
              <tr key={index}>
                <td>{row.symbol}</td>
                <td>{row.entryPrice}</td>
                <td>{row.exitPrice}</td>
                <td>{row.quantity}</td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="proceed-btn" onClick={handleProceed}>
        Proceed to Analysis
      </button>
    </div>
  );
}

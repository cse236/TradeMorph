const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const mongoose = require('mongoose'); // Keep this if you installed MongoDB, otherwise comment it out

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION (Optional - Comment out if not using MongoDB) ---
// mongoose.connect('mongodb://127.0.0.1:27017/trademorph')
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch(err => console.log("⚠️ MongoDB Not Connected (Running without DB)"));
// -------------------------------------------------------------------------

// ROUTE 1: PREDICT (Standard Search)
// Usage: GET http://localhost:5000/api/predict/TATASTEEL
app.get('/api/predict/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    console.log(`🔍 Analyzing: ${symbol}`);

    // Call Python Script (No 'train' flag)
    const pythonProcess = spawn('python', ['./engine/predict.py', symbol]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.on('close', (code) => {
        try {
            // Parse the JSON result from Python
            const result = JSON.parse(dataString);
            
            if (result.error) {
                return res.status(400).json(result);
            }
            
            res.json(result);
        } catch (error) {
            console.error("❌ Python Error:", dataString); // Print the raw error if JSON fails
            res.status(500).json({ error: "Failed to analyze data", details: dataString });
        }
    });
});

// ROUTE 2: FORCE RETRAIN (The "Retrain Model" Button)
// Usage: POST http://localhost:5000/api/train/TATASTEEL
app.post('/api/train/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    console.log(`⚡ Retraining Model for: ${symbol}`);

    // Call Python Script WITH 'train' flag
    const pythonProcess = spawn('python', ['./engine/predict.py', symbol, 'train']);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.on('close', (code) => {
        try {
            const result = JSON.parse(dataString);
            if (result.error) {
                return res.status(400).json(result);
            }
            res.json(result);
        } catch (error) {
            console.error("❌ Retrain Error:", dataString);
            res.status(500).json({ error: "Failed to retrain model", details: dataString });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process'); 
const path = require('path');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. DATABASE CONNECTION ---
const MONGO_URI = "mongodb+srv://omkarshirsath28_db_user:8XD2hsJdwqmMRLBd@trademorph.cuktris.mongodb.net/trademorph?retryWrites=true&w=majority&appName=TradeMorph";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

const JWT_SECRET = "abcd";

// --- 2. AUTH ROUTES ---
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    
    res.json({ 
      token, 
      user: { 
        id: user._id,
        username: user.username, 
        balance: user.virtualBalance,
        watchlist: user.watchlist,
        portfolio: user.portfolio // Send portfolio on login
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. AI ENGINE BRIDGE ---
app.get('/api/predict/:symbol', (req, res) => {
  const symbol = req.params.symbol;
  const scriptPath = path.join(__dirname, 'engine', 'predict.py');
  const pythonProcess = spawn('python', [scriptPath, symbol]);

  let dataString = '';

  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: "Prediction failed" });
    }
    try {
      const jsonResult = JSON.parse(dataString);
      res.json(jsonResult);
    } catch (e) {
      res.status(500).json({ error: "Failed to parse Python response" });
    }
  });
});

// --- 4. TRADING ROUTE (UPDATED) ---
app.post('/api/trade', async (req, res) => {
  const { userId, stock, type, price, quantity } = req.body;
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const tradePrice = Number(price);
    const tradeQty = Number(quantity);
    const totalCost = tradePrice * tradeQty;

    // --- BUY LOGIC ---
    if (type === 'BUY') {
      if (user.virtualBalance < totalCost) {
        return res.status(400).json({ error: "Insufficient Funds" });
      }

      user.virtualBalance -= totalCost;

      // Update Portfolio
      const existingIndex = user.portfolio.findIndex(p => p.symbol === stock);
      
      if (existingIndex > -1) {
        // Update avg price and quantity
        const oldQty = user.portfolio[existingIndex].quantity;
        const oldAvg = user.portfolio[existingIndex].avgPrice;
        const newAvg = ((oldAvg * oldQty) + totalCost) / (oldQty + tradeQty);
        
        user.portfolio[existingIndex].quantity += tradeQty;
        user.portfolio[existingIndex].avgPrice = newAvg;
      } else {
        // Add new stock
        user.portfolio.push({ 
          symbol: stock, 
          quantity: tradeQty, 
          avgPrice: tradePrice 
        });
      }
    } 

    // --- SELL LOGIC ---
    else if (type === 'SELL') {
      const existingIndex = user.portfolio.findIndex(p => p.symbol === stock);

      if (existingIndex === -1 || user.portfolio[existingIndex].quantity < tradeQty) {
        return res.status(400).json({ error: "Insufficient Holdings" });
      }

      user.virtualBalance += totalCost;
      user.portfolio[existingIndex].quantity -= tradeQty;

      if (user.portfolio[existingIndex].quantity <= 0) {
        user.portfolio.splice(existingIndex, 1);
      }
    }

    await user.save();

    const newTransaction = new Transaction({
      userId,
      symbol: stock,
      type,
      quantity: tradeQty,
      price: tradePrice,
      totalAmount: totalCost,
      date: new Date()
    });
    await newTransaction.save();

    res.json({ 
      message: "Trade Executed", 
      newBalance: user.virtualBalance,
      portfolio: user.portfolio 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- 5. TRANSACTIONS ---
app.get('/api/trades/:userId', async (req, res) => {
  try {
    const trades = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 6. WATCHLIST ---
app.post('/api/watchlist/toggle', async (req, res) => {
  const { userId, symbol } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.watchlist.indexOf(symbol);
    let action;
    if (index === -1) {
      user.watchlist.push(symbol);
      action = 'added';
    } else {
      user.watchlist.splice(index, 1);
      action = 'removed';
    }

    await user.save();
    res.json({ watchlist: user.watchlist, action });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
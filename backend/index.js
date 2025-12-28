const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const axios = require("axios");


const ML_API_URL = "http://127.0.0.1:5001/analyze";
const HoldingsModel = require("./models/HoldingsModel");
const OrdersModel = require("./models/OrderModel");
const PositionsModel = require("./models/PositionsModel");

const uploadRoutes = require("./routes/uploadRoutes");
dotenv.config();

const authRoutes = require("./routes/auth");

connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.post("/api/test-route", (req, res) => {
    res.json({ status: "TEST ROUTE WORKING" });
});





//authentication route
app.use("/auth",authRoutes);

app.use("/api/upload",uploadRoutes);
app.get("/",(req,res)=>{
    res.json({message : "working api call ..."});
})


//trade routes
const tradesRouter = require("./routes/trades");
app.use("/api/trades",tradesRouter);

//temp data puting in the database 
// app.get("/addHoldings", async(req,res)=>{
//     let tempHoldings = [
        
//         {
//             name: "BHARTIARTL",
//             qty: 2,
//             avg: 538.05,
//             price: 541.15,
//             net: "+0.58%",
//             day: "+2.99%",
//         },
//         {
//             name: "HDFCBANK",
//             qty: 2,
//             avg: 1383.4,
//             price: 1522.35,
//             net: "+10.04%",
//             day: "+0.11%",
//         },
//         {
//             name: "HINDUNILVR",
//             qty: 1,
//             avg: 2335.85,
//             price: 2417.4,
//             net: "+3.49%",
//             day: "+0.21%",
//         },
//         {
//             name: "INFY",
//             qty: 1,
//             avg: 1350.5,
//             price: 1555.45,
//             net: "+15.18%",
//             day: "-1.60%",
//             isLoss: true,
//         },
//         {
//             name: "ITC",
//             qty: 5,
//             avg: 202.0,
//             price: 207.9,
//             net: "+2.92%",
//             day: "+0.80%",
//         },
//         {
//             name: "KPITTECH",
//             qty: 5,
//             avg: 250.3,
//             price: 266.45,
//             net: "+6.45%",
//             day: "+3.54%",
//         },
//         {
//             name: "M&M",
//             qty: 2,
//             avg: 809.9,
//             price: 779.8,
//             net: "-3.72%",
//             day: "-0.01%",
//             isLoss: true,
//         },
//         {
//             name: "RELIANCE",
//             qty: 1,
//             avg: 2193.7,
//             price: 2112.4,
//             net: "-3.71%",
//             day: "+1.44%",
//         },
//         {
//             name: "SBIN",
//             qty: 4,
//             avg: 324.35,
//             price: 430.2,
//             net: "+32.63%",
//             day: "-0.34%",
//             isLoss: true,
//         },
//         {
//             name: "SGBMAY29",
//             qty: 2,
//             avg: 4727.0,
//             price: 4719.0,
//             net: "-0.17%",
//             day: "+0.15%",
//         },
//         {
//             name: "TATAPOWER",
//             qty: 5,
//             avg: 104.2,
//             price: 124.15,
//             net: "+19.15%",
//             day: "-0.24%",
//             isLoss: true,
//         },
//         {
//             name: "TCS",
//             qty: 1,
//             avg: 3041.7,
//             price: 3194.8,
//             net: "+5.03%",
//             day: "-0.25%",
//             isLoss: true,
//         },
//         {
//             name: "WIPRO",
//             qty: 4,
//             avg: 489.3,
//             price: 577.75,
//             net: "+18.08%",
//             day: "+0.32%",
//         },
//     ];

//     tempHoldings.forEach((item)=>{
//         let newHolding = new HoldingsModel({
//             name: item.name,
//             qty: item.qty,
//             avg: item.avg,
//             price: item.price,
//             net: item.net,
//             day: item.day,
//         });

//         newHolding.save();
//     });
//     res.send("Done");

// })

// app.get("/addPositions", async(req,res)=>{
//     let tempPositions = [
        
//        {
//             product: "CNC",
//             name: "EVEREADY",
//             qty: 2,
//             avg: 316.27,
//             price: 312.35,
//             net: "+0.58%",
//             day: "-1.24%",
//             isLoss: true,
//         },
//         {
//             product: "CNC",
//             name: "JUBLFOOD",
//             qty: 1,
//             avg: 3124.75,
//             price: 3082.65,
//             net: "+10.04%",
//             day: "-1.35%",
//             isLoss: true,
//         },
//     ];

//     tempPositions.forEach((item)=>{
//         let newPositions = new PositionsModel({
//             product:item.product,
//             name: item.name,
//             qty: item.qty,
//             avg:item.avg,
//             price: item.price,
//             net:item.net,
//             day:item.day,
//             isLoss:item.isLoss,
//         });

//         newPositions.save();
//     });
//     res.send("Done");

// })

app.get("/allHoldings",async(req,res)=>{
    let allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
})

app.get("/allPositions",async(req,res)=>{
    let allPositions = await PositionsModel.find({});
    res.json(allPositions);
})

app.post("/newOrder",async(req,res)=>{
    let newOrder = new OrdersModel({
        name:req.body.name ,
        qty: req.body.qty,
        price: req.body.price,
        mode: req.body.mode,
    });
    newOrder.save();
    res.send("Order Saved !");

})

// ---------------- ML Behavioral Analysis Route ----------------
app.post("/api/ml/analyze-stock", async (req, res) => {
  try {
    const { stock, action } = req.body;

    if (!stock || !action) {
      return res.status(400).json({
        error: "Stock symbol and action (BUY/SELL) are required"
      });
    }

    // Call Flask ML backend
    const mlResponse = await axios.post(ML_API_URL, { stock });
    const probs = mlResponse.data;

    let allowOrder = true;
    let warning = null;

    // -------- Action-based Behavioral Logic --------
    if (action === "SELL" && probs.PANIC_SELL > 0.35) {
      allowOrder = false;
      warning = {
        type: "PANIC_SELL",
        message:
          "You may be selling due to panic behavior. Consider reviewing market conditions before selling."
      };
    }

    if (action === "BUY" && probs.FOMO_BUY > 0.35) {
      allowOrder = false;
      warning = {
        type: "FOMO_BUY",
        message:
          "You may be buying due to FOMO. Consider waiting for confirmation before buying."
      };
    }

    return res.json({
      stock,
      action,
      allowOrder,
      warning,
      confidence: probs
    });

  } catch (error) {
    return res.status(500).json({
      error: "ML service error",
      details: error.message
    });
  }
});



const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})

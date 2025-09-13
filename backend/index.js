const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const mongoose = require("mongoose");
const uploadRoutes = require("./routes/uploadRoutes");
dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/upload",uploadRoutes);
app.get("/",(req,res)=>{
    res.json({message : "working api call ..."});
})


//trade routes
const tradesRouter = require("./routes/trades");
app.use("/api/trades",tradesRouter);


const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})

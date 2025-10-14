const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const uploadRoutes = require("./routes/uploadRoutes");
dotenv.config();

const authRoutes = require("./routes/auth");

connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

//authentication route
app.use("/auth",authRoutes);

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

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const mongoose = require("mongoose");
dotenv.config();

connectDB();

const app = express();

app.get("/",(req,res)=>{
    res.json({message : "working api call ..."});
})

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})

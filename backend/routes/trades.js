const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");

//fetching all trades
router.get("/",async(req , res)=>{
    try{
        const trades = await Trade.find().sort({createdAt: -1});//latest first
        const newTrades = trades.map(trade =>{
            const plpercent = ((trade.sellPrice - trade.buyPrice)/trade.buyPrice)*100;
            return{
                ...trade.toObject(),
                plpercent:plpercent.toFixed(2)//added new field called plprecent having value tile 2 decimal points ex 8.22
            };
        });
        res.json(newTrades);
    }catch(err){
        res.status(500).json({error:err.message});
    }
});

module.exports = router;
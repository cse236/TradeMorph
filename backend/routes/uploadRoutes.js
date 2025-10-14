const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const Trade = require("../models/Trade");

const router = express.Router();

//Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname,"..","uploads");
fs.mkdirSync(UPLOAD_DIR,{recursive:true});

//Multer config
const upload = multer({dest:UPLOAD_DIR});

//post /api/upload

router.post("/",upload.single("file"),(req,res)=>{
    if(!req.file)
        return res.status(400).json({error:"NO file uploaded(field name must be 'file')."});

    const results =[];
    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data",(row)=>{
        results.push({
            symbol:row.symbol,
            qty:Number(row.qty),
            buyPrice:Number(row.buy),
            sellPrice:Number(row.sell),
            entryDate:new Date(row.entryDate),
            exitDate:new Date(row.exitDate),
        });
    })
    .on("end",async()=>{
    try{
       const savedTrades =  await Trade.insertMany(results);

       //map the saved Trades to match frontend table
        const tradesForFrontend = savedTrades.map((t) => ({
          symbol: t.symbol,
          entryPrice: t.buyPrice,
          exitPrice: t.sellPrice,
          quantity: t.qty,
          date: t.entryDate.toISOString().split("T")[0], // format date
        }));

        res.json({ trades: tradesForFrontend });


    }catch(err){
        res.status(500).json({error:err.message});
    }finally{
        fs.unlink(req.file.path, ()=>{});//cleanup the temp file

    }
 });
});


module.exports = router;


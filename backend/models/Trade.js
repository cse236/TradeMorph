const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
    {
        symbol:{type:String,required: true,trim:true,uppercase:true,index:true},
        qty:{type:Number,required:true,min:1},
        buyPrice:{type:Number,required:true,min:0},
        sellPrice:{type:Number,required:true,min:0},
        entryDate:{type:Date,required:true},
        exitDate:{type:Date,required:true},
    },{timestamps:true}

);


module.exports = mongoose.model("Trade",tradeSchema);
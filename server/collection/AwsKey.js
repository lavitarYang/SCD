const mongoose = require("mongoose");
const schema = mongoose.Schema(
    {
        awsKey:{
            type:String,
            required :[true,"no identical key which is not allow"]
        },
        ID:{
            type:Number,
            required: [true,"must include id to GET :id from aws"]
        }
    }
)
const awsKey = mongoose.model("awsKey",schema); //(collection name in db , data model)
module.exports= awsKey;
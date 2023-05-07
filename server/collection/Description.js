const mongoose = require("mongoose");
const schema = mongoose.Schema(
    {
        ID:{
            type:Number,
            required: [true,"must include id to GET :id from aws"]
        },
        commentOne:{
            type:String,
            default:""
        },
        commentTwo:{
            type:String,
            default:""
        },
        key1: { type: mongoose.Schema.Types.Mixed },
        key2: { type: mongoose.Schema.Types.Mixed }, 
    }
)
const Description = mongoose.model("description",schema);
module.exports=Description;
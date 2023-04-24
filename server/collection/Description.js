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
        MLtimestamp:{
            type:{
                boobs:{
                    type:String,
                    default:""
                },
                butt:{
                    type:String,
                    default:""
                }
            }
        }
    }
)
const Description = mongoose.model("description",schema);
module.exports=Description;
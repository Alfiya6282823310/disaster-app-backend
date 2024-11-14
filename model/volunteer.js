const mongoose=require("mongoose")
const adminSchema=mongoose.Schema(
    {
        name:{type:String,required:true},
        age:{type:Number,required:true},
        sex:{type:String,required:true},
        location:{type:String,required:true},
        district:{type:String,required:true},
        category:{type:String,required:true},
        phone:{type:Number,required:true},
        date:{type:Date,
            default:Date.now
        },
        email:{type:String,required:true},
        password:{type:String,required:true}
    }
)
const volunteerModel=mongoose.model("volunteerSignUp",adminSchema)
module.exports=volunteerModel
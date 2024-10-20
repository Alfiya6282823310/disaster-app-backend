const mongoose=require("mongoose")
const adminSchema=mongoose.Schema(
    {
        name:{type:String,required:true},
        address:{type:String,required:true},
        camplocation:{type:String,required:true},
        localbody:{type:String,required:true},
        district:{type:String,required:true},
        phone:{type:Number,required:true},
        email:{type:String,required:true},
        password:{type:String,required:true}
    }
)
const userModel=mongoose.model("user",adminSchema)
module.exports=userModel
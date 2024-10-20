const mongoose=require("mongoose")
const adminSchema=mongoose.Schema(
    {
        email:{type:String,required:true},
        password:{type:String,required:true}
    }
)
const officerModel=mongoose.model("officerSignUp",adminSchema)
module.exports=officerModel
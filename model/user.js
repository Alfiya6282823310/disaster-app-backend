const mongoose=require("mongoose")
const adminSchema=mongoose.Schema(
    {
        
        name:{type:String,required:true},
        sex:{type:String,required:true},
        age:{type:String,required:true},
        address:{type:String,required:true},
        camplocation:{type:String,required:true},
        localbody:{type:String,required:true},
        district:{type:String,required:true},
        phone: {
            type: Number,
            required: true,
            validate: {
                validator: function(v) {
                    return /^\d{10}$/.test(v); // Checks if the number is exactly 10 digits
                },
                message: props => `${props.value} is not a valid phone number!`
            }
        },
        postedDate:{type:Date,
            default:Date.now
        },
        email:{type:String,required:true},
        password:{type:String,required:true}
    }
)
const userModel=mongoose.model("user",adminSchema)
module.exports=userModel
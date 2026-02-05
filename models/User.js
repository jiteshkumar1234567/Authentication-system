const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
name:String,
email:{type:String,unique:true},
password:String,
googleId:String,
isVerified:{type:Boolean,default:false},
resetToken:String
});


module.exports = mongoose.model("User",userSchema);
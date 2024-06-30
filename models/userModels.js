const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs");
// const { config } = require("dotenv");
const jwt = require('jsonwebtoken');
const config = require("../config/config")



const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, "Please enter your name"],
        maxlength: [30, "name cannot exceed 30"],
        minlength: [2, "name is too short"],
    },
    email : {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "please enter a valid email"]
    },
    password : {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [8, "password should greater than 8 characters"],
    },
    avatar:
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        },
    role: {
        type: String,
        default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,


});

userSchema.pre("save", async function(next){
    
    if(!this.isModified("password")){
        next()
    }

    this.password = await bcrypt.hash(this.password,10)

})



userSchema.methods.getJWTToken = function() {
    return jwt.sign({id:this._id}, config.JWT_SECRET,{
        expiresIn: config.JWT_EXPIRES,
    });
}



userSchema.methods.comparePassword = async function(enteredPassword){
    return bcrypt.compare(enteredPassword,this.password)
}


module.exports = mongoose.model("User", userSchema)
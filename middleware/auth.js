const User = require("../models/userModels");
const Errorhandler = require("../utils/errorhandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken")
const config = require("../config/config");
const { isNumeric } = require("validator");


exports.isAuthenticated = catchAsyncError(async(req,res,next)=>{
    const {token} = req.cookies

    if(!token){
        return next(new Errorhandler("please login to use this resource",401))
    }

    const decodedData = jwt.verify(token, config.JWT_SECRET);
    req.user = await User.findById(decodedData.id)

    next();

    // console.log(token)
});

exports.authorizedRoles = (...roles) =>{
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(
                new Errorhandler(`Role ${req.user.role} is not authenticated`,403)
            )
        }

        next();
    }

}



// module.exports = isAuthenticated;
// module.exports = authorizedRoles;
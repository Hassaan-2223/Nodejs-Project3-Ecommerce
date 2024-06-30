
const config = require("../config/config")

const sendToken = (dbemail,statuscode,res)=>{
    const token = dbemail.getJWTToken();

    const options = {
        expiresIn: new Date(
            Date.now() + config.COOKIE_EXPRIRE * 24 *60 * 60 * 1000
        ),
        httpOnly: true
    }


    res.status(statuscode).cookie("token",token, options).json({
        success: true,
        dbemail,
        token,
    })
}


module.exports = sendToken
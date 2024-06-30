const Errorhandler = require("../utils/errorhandler")



module.exports = (err,req,res,next)=>{
    err.statuscode = err.statuscode || 500;
    err.message = err.message || "internal server error";

    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`
        err = new Errorhandler(message,400)
    }

    res.status(err.statuscode).json({
        success: false,
        message: err.message
    })

}
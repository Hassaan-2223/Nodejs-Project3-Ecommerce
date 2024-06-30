const express = require('express')
require('./db/conn')
const port = process.env.PORT || 8000;
const cookieParser = require("cookie-parser")



const app = express()


app.use(express.json())
app.use(cookieParser())


// ------------------------- HANDLING UNCAUGHT ERROR --------------------

process.on("uncaughtException",err=>{
    console.log(`error:${err.message}`)
    console.log("shutting down the server")
    server.close(()=>{
        process.exit(1)
    })
})



// ------------------------ HANDLING UNRESOLVED ERROR --------------------



process.on("unhandledRejection",err=>{
    console.log(`error:${err.message}`)
    console.log("shutting down the server")
    server.close(()=>{
        process.exit(1)
    })
})



// --------------------- ROUTES ----------------------------
const productroutes = require('./routes/productRoutes')
app.use(productroutes)


// ----------------------- MIDDLEWARE FOR ERRORS --------------------

const errorMiddleware = require("./middleware/error")
app.use(errorMiddleware)



























const server = app.listen(port, (req,res)=>{
    console.log('listening')
})









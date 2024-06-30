const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter your name"]
    },
    description:{
        type:String,
        required:[true,"Please enter product description"]
    },
    price:{
        type:Number,
        required:[true,"Please enter price"],
        maxLength:[8,"price cant exceed 8 digits"],
        trim:true
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"please enter the product category"]
    },
    stock:{
        type:Number,
        required:[true,"please enter the product stock"],
        maxLength:[true,"stock cant exceed 4 characteristics"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref: "user",
                required: true,
            },
            name:{
                type:String,
                required:[true,"please enter your name"]
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
            }
        }
        
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }

})


module.exports = mongoose.model("Product",productSchema)
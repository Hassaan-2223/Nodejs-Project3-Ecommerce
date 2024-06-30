const express = require('express')
const mongoose = require('mongoose')
const router = new express.Router()

// ^^^^^^^^^^^^^ EXPORTING PRODUCT MODEL ^^^^^^^^^^^^^^
const Product = require("../models/productmodel")

// ^^^^^^^^^^^^^ EXPORTING USER MODEL ^^^^^^^^^^^^^^
const User = require("../models/userModels")

// ^^^^^^^^^^^^^ EXPORTING ORDER MODEL ^^^^^^^^^^^^^^

const Order = require("../models/orderModel")

// ^^^^^^^^^^^^^ EXPORTING UTILS ^^^^^^^^^^^^^^
const Errorhandler = require('../utils/errorhandler')

const ApiFeatures = require('../utils/apiFeatures')


// ^^^^^^^^^^^^^ EXPORTING MIDDLEWARE ^^^^^^^^^^^^^^
const catchAsyncError = require("../middleware/catchAsyncError")


const sendToken = require("../utils/jwttoken")
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");



// ---------------------------- GET ALL PRODUCT -----------------------------

router.get("/product",isAuthenticated,authorizedRoles("admin"),catchAsyncError(async(req,res,next)=>{

    const resultPerPage = 5
    const productCount = await Product.countDocuments();

    const apifeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);
    // console.log(apifeature.query.getQuery())

    const products = await apifeature.query;
    res.status(200).json({
        success:true,
        products,
    })
})

)



// ---------------------------- GET SINGLE PRODUCT -----------------------------


router.get("/product/:id",catchAsyncError(async(req,res,next)=>{
    const productId = req.params.id

    let product = await Product.findById(productId)

    if(!product){
        return next(new Errorhandler("product not found",404))
    }

    res.status(200).json({
        success:true,
        product,
        productCount,
    })
})

)








// ---------------------------- PRODUCT REVIEWS AND RATINGS -----------------------------



router.get("/productreview",isAuthenticated,catchAsyncError(async(req,res,next)=>{
    const {rating,comment,productId} = req.body

    const review = {
        user:req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId)

    const isreviewed = await product.reviews.find(rev => rev.user.toString()===req.user._id.toString())

    if(isreviewed){
        product.review.forEach(rev =>{
            if(rev.user.toString()===req.user._id.toString()){
                rev.rating = rating
                rev.comment = comment
            }
        });

    }
    else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0
    product.ratings = product.reviews.forEach(rev =>{
        avg+=rev.rating
    })

    product.ratings = avg/product.reviews.length

    await product.save({runValidators:false})


    res.status(200).json({
        success:true,
    })
}))





// ---------------------------- GET REVIEWS OF A PRODUCT -----------------------------



router.get("/productReview",catchAsyncError(async(req,res,next)=>{
    
    const product = await Product.findById(req.query.id)

    if(!product){
        return next(new Errorhandler("product not found",404))
    }



    res.status(200).json({
        success:true,
        reviews: product.reviews,
    })
})

)




// ---------------------------- DELETE REVIEWS OF A PRODUCT -----------------------------


router.delete("/reviewDelete",isAuthenticated,catchAsyncError(async(req,res,next)=>{
    
    const product = await Product.findById(req.query.productid)

    if(!product){
        return next(new Errorhandler("product not found",404));
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString())

    let avg = 0
    reviews.forEach(rev =>{
        avg+=rev.rating
    })

    const ratings = avg/reviews.length

    const numOfRating = reviews.length

    await product.findByIdAndUpdate(req.query.productid,{
        reviews,
        ratings,
        numOfRating,
    },
    {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success:true,
        reviews: product.reviews,
    });
})


)









// ---------------------------------------------------------------------------
// ****************************** ADMIN ROUTES *******************************
// ---------------------------------------------------------------------------



// ---------------------------- CREATE PRODUCT -----------------------------

router.post("/product/new",isAuthenticated,catchAsyncError(async(req,res,next)=>{
    
        const newProduct = new Product(req.body);
        const productCreated = await newProduct.save();
        res.status(201).json({
            success:true,
            productCreated,
        })

    
    
}
)

)


// ------------------------------- UPDATE PRODUCT --------------------------------


router.put("/product/:id",isAuthenticated,catchAsyncError(async(req,res,next)=>{
    
    const productId = req.params.id;
    const updatedData = req.body;

    let product = await Product.findById(productId)
    

    if(!product){
        return next(new Errorhandler("product not found",404))
        
        
    }

    const Updatedproduct = await Product.findByIdAndUpdate(productId,updatedData,{
        runValidators: true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true,
        Updatedproduct,
    })

})

)

// ------------------------------ DELETE PRODUCT ----------------------


router.delete("/product/:id",isAuthenticated,catchAsyncError(async(req,res,next)=>{
    const productId = req.params.id

    let product = await Product.findById(productId)
    

    if(!product){
        return next(new Errorhandler("product not found",404))
    }

    const deletedProduct = await Product.findByIdAndDelete(productId)

    res.status(200).json({
        success:true,
        message:"product is deleted"
    })
    
})

)







// ---------------------------------------------------------------------------
// ****************************** USER ROUTES *******************************
// ---------------------------------------------------------------------------








// ------------------------------ REGISTER USER ----------------------






router.post("/register", catchAsyncError(async(req,res,next)=>{
    const {name, email, password }  = req.body

    const newUser = new User({
        name,
        email,
        password,
        avatar: {
            public_id: "this is a sample id",
            url: "profile pic"
        }
    })

    const registeredUser = await newUser.save()

    const token = newUser.getJWTToken();

    sendToken(newUser,200,res)
}))







// ------------------------------ LOGIN USER ----------------------




router.post("/login",catchAsyncError(async(req,res,next)=>{

    
    const {email,password} = req.body

    const dbemail = await User.findOne({email});
        
    if(!dbemail){
        return next(new Errorhandler("User not found"))
    }

    const isPasswordMatched = await dbemail.comparePassword(password)


    if(!isPasswordMatched){
        return next(new Errorhandler("User not found"))
    }


    const token = dbemail.getJWTToken();

    sendToken(dbemail,200,res)

})

)



// ------------------------------ LOGOUT USER ----------------------


router.get("/logout",catchAsyncError(async(req,res,next)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "logged Out",
    });

}))









// ---------------------------------------------------------------------------
// ****************************** USER DETAILS ROUTES *******************************
// ---------------------------------------------------------------------------




// ------------------------------ GET USER DETAILS ----------------------

router.get("/me",isAuthenticated, catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user,
    })
}))



// ------------------------------ UPDATE PASSWORD ----------------------



router.put("/updatePassword",isAuthenticated, catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password")


    const isPasswordMatched = await user.comparePassword(req.body.oldpassword)

    if(!isPasswordMatched){
        return next(new Errorhandler("password doesn't matched", 400))
    }

    if(req.body.newpassword !== req.body.confirmpassword){
        return next(new Errorhandler("password doesn't matched", 400))
    }

    user.password = req.body.newpassword

    await user.save()

    sendToken(user,200,res)
}))



// ------------------------------ UPDATE PROFILE ----------------------


router.put("/updateProfile",isAuthenticated,catchAsyncError(async(req,res,next)=>{
    
    const newData = {
        name: req.body.name,
        email: req.body.email,
    }

    const user = await User.findByIdAndUpdate(req.user.id,newData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
    })

}))






// ------------------------------ ADMIN GET UESRS OR UESR ----------------------



router.get("/getUsers",isAuthenticated, authorizedRoles("admin") ,catchAsyncError(async(req,res,next)=>{
    const user = await User.find()

    res.status(200).json({
        success: true,
        user,
    })
}))
router.get("/getUser/:id",isAuthenticated, authorizedRoles("admin"),catchAsyncError(async(req,res,next)=>{
    const user = await User.find(req.params.id)

    if(!user){
        return new Errorhandler(`${req.params.id} does not exists in the database`)
    }

    res.status(200).json({
        success: true,
        user,
    })
}))


// ------------------------------ ADMIN UPDATE UESRS OR UESR ----------------------



router.put("/updateProfile",isAuthenticated,catchAsyncError(async(req,res,next)=>{
    
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id,newData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
    })

}))









router.delete("/updateProfile",isAuthenticated,catchAsyncError(async(req,res,next)=>{
    
   
    const user = await User.findById(req.params.id)

    if(!user){
        return new Errorhandler(`${req.params.id} user not found `)
    }
    
    const userdelete = await User.findByIdAndDelete(req.params.id)
    

    res.status(200).json({
        success: true,
    })

}))









// ---------------------------------------------------------------------------
// ****************************** ORDER ROUTES *******************************
// ---------------------------------------------------------------------------



// --------------------------------- CREATE ORDER ---------------------------

router.post("/order/new", isAuthenticated, catchAsyncError(async (req, res, next) => {
    // Extract order data from the request body
    const {
        orderItems,
        shippingInfo,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        
    } = req.body;

    // Create a new order in the database
    const order = await Order.create({
        user: req.user._id, // Assuming you have user ID stored in req.user
        orderItems,
        shippingInfo,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
    });

    res.status(201).json({
        success: true,
        order,
    });
}));



// --------------------------------- GET SINGLE ORDER ---------------------------


// GET single order by ID
router.get('/order/:id', isAuthenticated, authorizedRoles("admin"), catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate({
        path: 'orderItems.product',
        select: 'name price'
    });

    if (!order) {
        return next(new Errorhandler("order not found", 404))
    }

    // Optional: Check if the logged-in user is the one who placed the order or if they are an admin

    res.status(200).json({
        success: true,
        order,
    });
}));


// --------------------------------- USER GET ORDER ------------------------



router.get("/me", isAuthenticated , catchAsyncError(async (req, res, next) => {
    const order = await Order.find({user: req.user._id})

    res.status(200).json({
        success: true,
        order,
    });
}));



// --------------------------------- GET ALL ORDER ---------------------------



router.get("/allOrders", isAuthenticated, authorizedRoles("admin"), catchAsyncError(async (req, res, next) => {
    const order = await Order.find()

    let totalAmount = 0;

    order.forEach(ord =>{
        totalAmount+=ord.totalPrice;
    })

    res.status(200).json({
        success: true,
        order,
        totalAmount,
    });
}));

// --------------------------------- UPDATE ORDER STATUS ---------------------------



router.put("/orderStatus/:id", isAuthenticated, authorizedRoles("admin"), catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)


    if(order.orderStatus === "Delieverd"){
        return next(new Errorhandler("you have already deliverd this order",400))
    };

    order.orderItems.forEach(async ord =>{
       await updateStock(ord.product, ord.quantity)
    })

    order.orderStatus = req.body.status

    if(req.body.status === "Delieverd"){
        order.deliveredAt = Date.now()
    }

    await order.save({validatorBeforeSave: false})

    res.status(200).json({
        success: true,
        
    });


    async function updateStock(id,quantity){
        const product = await Product.findById(id)

        product.stock -= quantity
        
        await product.save({validatorBeforeSave: false})
    }

}));








router.delete("/deleteOrder/:id", isAuthenticated, authorizedRoles("admin"), catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if(!order){
        return next(new Errorhandler("Order not found",404))
    }

    await order.remove()

    await order.save({validatorBeforeSave: false})

    res.status(200).json({
        success: true,
        
    });



}));


















module.exports = router;
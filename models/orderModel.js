const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User' // Assuming you have a User model defined
    },
    orderItems: [{
        product: { 
            type: mongoose.Schema.ObjectId, 
            required: true, 
            ref: 'Product' // Assuming you have a Product model defined
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: Number, required: true },
        phoneNumber: { type: Number, required: true },
    },
    // paymentMethod: {
    //     type: String,
    //     required: true
    // },
    paymentInfo: { // This can be populated based on the payment gateway's response
        id: { type: String },
        status: { type: String },
        // update_time: { type: String },
        // email_address: { type: String }
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    paidAt: {
        type: Date,
        required: true, 
    },
    orderStatus: {
        type: String,
        required: true,
        default: "processing",
    },
    deliveredAt: {
        type: Date
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

const express = require('express');
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');
const { default: mongoose } = require('mongoose');
const razorpay = require("../config/razorpay-config");
const crypto = require('crypto');

router.get("/", (req, res) => {
    const error = req.flash("error");
    res.render("index", { error, isLoggedIn: false });
});

router.get("/shop", isLoggedIn, async(req, res) => {
    try {
        let products = await productModel.find();

        if(req.query.sortby === "lowtohigh"){
            products = products.sort((a, b) => a.price - b.price);
        } else if(req.query.sortby === "hightolow"){
            products = products.sort((a, b) => b.price - a.price);
        }

        if(req.query.filter === "newcollection"){
            products = products.sort((a, b) => b._id - a._id).slice(0, 4);
        }else if(req.query.filter === "discounted"){
            products = products.filter(product => product.discount > 0);
        }

        const success = req.flash("success");   
        const error = req.flash("error");    
        res.render("shop", { products, success, error });
    } catch (error) {
        console.log(error.message);
        res.redirect('/');
    }
});

router.get("/addtocart/:productid", isLoggedIn, async(req, res) => {
    try {
        const existingUser = await userModel.findOne({ email: req.user.email });
        const productObjectId = new mongoose.Types.ObjectId(req.params.productid);

        if(existingUser.cart.includes(productObjectId)){
            req.flash("error", "Already added to cart!");
            return res.redirect("/shop");
        }

        existingUser.cart.push(productObjectId);
        await existingUser.save();
        req.flash("success", "Added to cart!");
        res.redirect("/shop");
    } catch (error) {
        res.send(error.message);
    }   
});

router.get("/cart", isLoggedIn, async(req, res) => {
    const existingUser = await userModel.findOne({ email: req.user.email }).populate("cart");
    const cartItems = existingUser.cart;
    const warning = req.flash("warning");
    res.render("cart", { cartItems, warning });
});

router.get("/deletefromcart/:productid", isLoggedIn, async(req, res) => {
    try {
        const existingUser = await userModel.findOne({ email: req.user.email });
        const productObjectId = new mongoose.Types.ObjectId(req.params.productid);

        existingUser.cart = existingUser.cart.filter(item => !item.equals(productObjectId));
        await existingUser.save();
        
        req.flash("warning", "Removed from cart!");
        res.redirect("/cart");
    } catch (error) {
        res.send(error.message);
    }    
});

router.get("/profile", isLoggedIn, async(req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        if(!user){
            req.flash("error", "User not found");
            res.redirect("/");
        }
        
        const success = req.flash("success");
        const error = req.flash("error");
        res.render("profile", { user, success, error}); 
    } catch (error) {
         res.send(error.message); 
    }
});

router.get("/address", isLoggedIn, async(req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        if(!user){
            req.flash("error", "User not found");
            res.redirect("/");
        }
        
        const success = req.flash("success");
        const error = req.flash("error");
        res.render("address", { address: user.address, success, error});
    } catch (error) {
        res.send(error.message);
    }
});

router.get("/orders", isLoggedIn, async(req, res) => {
    res.send("Orders");
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

router.post("/create-order", isLoggedIn, async (req, res) => {
    try {
        const { totalAmount } = req.body;

        const order = await razorpay.orders.create({
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`
        })        
        res.json(order);

    } catch (error) {
        console.log(error.message);
        res.send("Error creating order");
    }
});

router.post("/verify-payment", isLoggedIn, async(req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, totalAmount } = req.body;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if(generatedSignature !== razorpay_signature){
            req.flash("error", "Payment verification failed!");
            return res.redirect("/cart");
        }

        const existingUser = await userModel.findOne({ email: req.user.email });
        existingUser.orders.push({ cartItems, totalAmount, orderId: razorpay_order_id, paymentId: razorpay_payment_id });
        existingUser.cart = [];
        await existingUser.save();
        res.json({ success: true, redirectUrl: "/order-confirm" });
    } catch (error) {
        console.log(error);
        req.flash("error", "Payment failed");
        res.redirect("/cart");
    }
});

router.get("/order-confirm", isLoggedIn, (req, res) => {
    res.render("order-confirm");
});

module.exports = router;
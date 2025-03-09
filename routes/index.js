const express = require('express');
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');
const { default: mongoose } = require('mongoose');

router.get("/", (req, res) => {
    const error = req.flash("error");
    res.render("index", { error, isLoggedIn: false });
});

router.get("/shop", isLoggedIn, async(req, res) => {
    const products = await productModel.find();
    const success = req.flash("success");   
    const error = req.flash("error");    
    res.render("shop", { products, success, error });
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

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

module.exports = router;
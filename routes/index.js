const express = require('express');
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');

router.get("/", (req, res) => {
    const error = req.flash("error");
    res.render("index", { error, isLoggedIn: false });
});

router.get("/shop", isLoggedIn, async(req, res) => {
    const products = await productModel.find();
    const success = req.flash("success");       
    res.render("shop", { products, success });
});

router.get("/addtocart/:productid", isLoggedIn, async(req, res) => {
    const productid = req.params.productid;
    const existingUser = await userModel.findOne({ email: req.user.email });
    if(existingUser){
        existingUser.cart.push(productid);
        await existingUser.save();
        req.flash("success", "Added to cart!");
        res.redirect("/shop");
    }    
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

module.exports = router;
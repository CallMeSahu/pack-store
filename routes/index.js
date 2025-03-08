const express = require('express');
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require('../models/product-model');

router.get("/", (req, res) => {
    const error = req.flash("error");
    res.render("index", { error, isLoggedIn: false });
});

router.get("/shop", isLoggedIn, async(req, res) => {
    const products = await productModel.find();
    res.render("shop", { products });
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
})

module.exports = router;
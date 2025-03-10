const express = require('express');
const router = express.Router();
const { createOwner } = require('../controllers/authController');
const isOwner = require('../middlewares/isOwner');
const productModel = require("../models/product-model");

router.get("/", (req, res) => {
    res.send("Hey Owner!");
});

router.post("/create", createOwner);

router.get('/admin', isOwner, (req, res) => {
  const error = req.flash("error");
  const success = req.flash("success");
  res.render("createproducts", { error, success, isLoggedIn: false });
});

router.get('/products', isOwner, async (req, res) => {
  try {
    const products = await productModel.find();
    const warning = req.flash("warning");
    const success = req.flash("success");
    res.render("products", {products, success, warning, isLoggedIn: false})
  } catch (error) {
    res.send(error.message);
  }
})

module.exports = router; 
const express = require('express');
const router = express.Router();
const { createOwner } = require('../controllers/authController');
const isOwner = require('../middlewares/isOwner');

router.get("/", (req, res) => {
    res.send("Hey Owner!");
});

router.post("/create", createOwner);

router.get('/admin', isOwner, (req, res) => {
  const error = req.flash("error");
  const success = req.flash("success");
  res.render("createproducts", { error, success, isLoggedIn: false });
});


module.exports = router; 
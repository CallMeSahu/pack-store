const express = require('express');
const router = express.Router();
const { createOwner } = require('../controllers/authController');

router.get("/", (req, res) => {
    res.send("Hey Owner!");
});

router.post("/create", createOwner);

router.get('/admin', (req, res) => {
  const error = req.flash("error");
  const success = req.flash("success");
  res.render("createproducts", { error, success });
});



module.exports = router; 
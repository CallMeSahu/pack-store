const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const upload = require("../config/multer-config");
const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');

router.get("/", (req, res) => {
    res.send("Hey User!");
});

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/update", isLoggedIn, upload.single("picture"), async (req, res) => {
    const picture = req.file ? req.file.buffer : req.user.picture;
    const { fullname, email, contact, newpassword, confirmpassword } = req.body;
    const updateFields = { fullname, email, contact, picture };
    if (newpassword && confirmpassword) {
        if (newpassword !== confirmpassword) {
            req.flash("error", "Passwords do not match!");
            return res.redirect("/profile");
        }
        bcrypt.hash(newpassword, 10, async (err, hash) => {
            updateFields.password = hash;
            const updatedUser = await userModel.findByIdAndUpdate(
                req.user.id,
                updateFields
            );
            if (updatedUser) {
                req.flash("success", "User updated!");
                return res.redirect("/profile");
            }
        });
    } else {
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id,
            updateFields
        );
        if (updatedUser) {
            req.flash("success", "User updated!");
            return res.redirect("/profile");
        }
    }
});



module.exports = router;
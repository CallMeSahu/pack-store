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
    try {
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
    } catch (error) {
        res.send(error.message);
    }
});

router.post("/update/address", isLoggedIn, async(req, res) => {
    try {
        const { addressLine1, addressLine2, city, state, pincode } = req.body;
        if (pincode.length !== 6) {
            req.flash("error", "Invalid inputs");
            res.redirect("/address");
        }

        const user = await userModel.findOne({ email: req.user.email });
        user.address = { addressLine1, addressLine2, city, state, pincode };
        await user.save();

        req.flash("success", "Address updated successfully!");
        res.redirect("/address");

    } catch (error) {
        res.send(error);
    }
})



module.exports = router;
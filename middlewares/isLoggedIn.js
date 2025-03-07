const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

const isLoggedIn = async (req, res, next) => {  // Add async here
    if (!req.cookies.token) {
        req.flash("error", "You need to login first");
        return res.redirect("/");
    }

    try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        
        const user = await userModel.findOne({ email: decoded.email }).select("-password"); // Await the DB call
        
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        req.flash("error", "Invalid token. Please log in again.");
        return res.redirect("/");
    }
};

module.exports = isLoggedIn;

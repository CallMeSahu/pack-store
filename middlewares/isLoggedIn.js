const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const isLoggedIn = (req, res, next) => {
    if(!req.cookies.token){
        req.flash("error", "You need to login first");
        return res.redirect("/");
    }

    try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        const user = userModel.findOne({ email: decoded.email }).select("-password");
        req.user = user;
        next();        
    } catch (error) {
        req.flash("error", "Something went wrong");
        return res.redirect("/");
    }
};
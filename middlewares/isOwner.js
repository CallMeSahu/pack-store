const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");

const isOwner = async (req, res, next) => {
    if(!req.cookies.token){
        req.flash("error", "You need to login first");
        return res.redirect("/");
    }

    try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        const owner = await ownerModel.findOne({ email: decoded.email }).select("-password");

        if(!owner){
            req.flash("error", "Please Login as Owner!");
            return res.redirect("/");
        }

        req.owner = owner;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        req.flash("error", "Invalid token. Please log in as owner.");
        return res.redirect("/");
    }
}

module.exports = isOwner;
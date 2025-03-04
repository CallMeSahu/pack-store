const mongoose = require("mongoose");

mongoose
.connect("mongodb+srv://callmesahu:12ab89yz@cluster0.uqntv2j.mongodb.net/pack-store")
.then(() => console.log("Database connected"))
.catch((err) => console.log(err));

module.exports = mongoose.connection
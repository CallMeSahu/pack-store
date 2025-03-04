const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://callmesahu:12ab89yz@cluster0.uqntv2j.mongodb.net/pack-store");

const productSchema = new mongoose.Schema({
    image: String,
    name: String,
    price: Number,
    discount: {
        type: Number,
        default: 0
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
})

module.exports = mongoose.model("product", productSchema);
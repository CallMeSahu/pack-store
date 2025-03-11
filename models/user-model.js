const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        minLength: 3,
        trim: true,
    },
    email: String,
    password: String,
    cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        }
    ],
    orders: {
        type: Array,
        default: []
    },
    contact: {
        type: String,
        default: null,
    },
    picture: {
        type: Buffer,
        default: null
    },
    address: {
        addressLine1: { type: String, default: null },
        addressLine2: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        pincode: { type: String, default: null,}
    }
});

module.exports = mongoose.model("user", userSchema);
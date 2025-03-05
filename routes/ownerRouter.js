const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owner-model");
const bcrypt = require('bcrypt');

router.get("/", (req, res) => {
    res.send("Hey Owner!");
});

if(process.env.NODE_ENV === "development") {
 router.post("/create", async(req, res) => {
    const owner = await ownerModel.find();
    if(owner.length > 0){
        return res.status(503).send("You can't create more than one owner");
    }

    const { fullname, email, password } = req.body;
    bcrypt.hash(password, 10, async(err, hash) => {
        const createdOwner = await ownerModel.create({
            fullname,
            email,
            password: hash
        })
        res.status(201).send(createdOwner);
    })
 })   
}

module.exports = router; 
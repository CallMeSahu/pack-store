const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owner-model");
const zod = require('zod');
const bcrypt = require('bcrypt');

router.get("/", (req, res) => {
    res.send("Hey Owner!");
});

const ownerSchema = zod.object({
    fullname: zod.string().min(3, "Full name must be atleast 3 characters long"),
    email: zod.string().email("Invalid email format"),
    password: zod.string().min(6, "Password must be atleast 6 characters long"),
})

router.post("/create", async (req, res) => {
    if(process.env.NODE_ENV !== "development"){
        return res.status(403).send("Forbidden in production");
    }

    try {
        const owner = await ownerModel.find();
        if (owner.length > 0) {
          return res.status(503).send("Can't create more than one owner");
        }

        const validation = ownerSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ error: validation.error.format() });
        }

        const { fullname, email, password } = req.body;
        bcrypt.hash(password, 10, async (err, hash) => {
          const createdOwner = await ownerModel.create({
            fullname,
            email,
            password: hash,
          });
          res.status(201).send(createdOwner);
        });
    } catch (error) {
        res.send(error.message);
    }
})

module.exports = router; 
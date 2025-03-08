const zod = require('zod');
const ownerModel = require("../models/owner-model");
const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

const ownerSchema = zod.object({
    fullname: zod.string().min(3, "Full name must be atleast 3 characters long"),
    email: zod.string().email("Invalid email format"),
    password: zod.string().min(6, "Password must be atleast 6 characters long"),
});

const createOwner = async (req, res) => {
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
}

const userSchema = zod.object({
    fullname: zod.string().min(3, "Full name must be atleast 3 characters long"),
    email: zod.string().email("Invalid email format"),
    password: zod.string().min(6, "Password must be atleast 6 characters long"),
});

const registerUser = async (req, res) => {
    try{
        const validation = userSchema.safeParse(req.body);
        if(!validation.success){
            req.flash("error", "Invalid inputs");
            return res.redirect("/");
        }

        const { fullname, email, password } = req.body;  
        const existingUser = await userModel.findOne({ email });
        if(existingUser){
            req.flash("error", "User already exists");
            return res.redirect("/");
        }

        bcrypt.hash(password, 10, async (err, hash) => {
            const createdUser = await userModel.create({
                fullname,
                email,
                password: hash
            })
            const token = generateToken({ email, userid: createdUser._id }); 
            res.cookie("token", token);
            res.redirect("/shop");  
        })
    }catch(error){
        res.send(error.message);
    }
}

const loginSchema = zod.object({
    email: zod.string().email("Invalid email format"),
    password: zod.string().min(6, "Password must be atleast 6 characters long"),
})

const loginUser = async (req, res) => {
    try {
        const validate = loginSchema.safeParse(req.body);
        if(!validate.success){
            req.flash("error", "Invalid inputs");
            return res.redirect("/");
        }

        const { email, password } = req.body;
        const existingUser = await userModel.findOne({ loginUser });
        if(!existingUser){
            req.flash("error", "Invalid Credentials");
            return res.redirect("/");
        }

        bcrypt.compare(password, existingUser.password, (err, result) => {
            if(result){
                const token = generateToken({ email, userid: existingUser._id });
                res.cookie("token", token);
                res.redirect("/shop");
            }else{
                req.flash("error", "Invalid Credentials");
                return res.redirect("/");
            }
        })
    } catch (error) {
        res.send(error.message);
    }
}

module.exports = { createOwner, registerUser, loginUser };
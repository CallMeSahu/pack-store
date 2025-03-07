const zod = require('zod');
const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

const userSchema = zod.object({
    fullname: zod.string().min(3, "Full name must be atleast 3 characters long"),
    email: zod.string().email("Invalid email format"),
    password: zod.string().min(6, "Password must be atleast 6 characters long"),
});

const registerUser = async (req, res) => {
    try{
        const validation = userSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({ error: validation.error.format() });
        }

        const { fullname, email, password } = req.body;  
        const existingUser = await userModel.findOne({ email });
        if(existingUser){
            return res.status(409).send("User already exists");
        }

        bcrypt.hash(password, 10, async (err, hash) => {
            const createdUser = await userModel.create({
                fullname,
                email,
                password: hash
            })
            const token = generateToken({ email, userid: createdUser._id }); 
            res.cookie("token", token);
            res.status(201).send(createdUser);   
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
            return res.status(400).json({ error: validate.error.format() });
        }

        const { email, password } = req.body;
        const existingUser = await userModel.findOne({ loginUser });
        if(!existingUser){
            return res.status(404).send("User not found");
        }

        bcrypt.compare(password, existingUser.password, (err, result) => {
            if(result){
                const token = generateToken({ email, userid: existingUser._id });
                res.cookie("token", token);
                res.status(200).send(existingUser);
            }else{
                res.status(401).send("Invalid credentials");
            }
        })
    } catch (error) {
        res.send(error.message);
    }
}

const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
}

module.exports = { registerUser, loginUser, logoutUser };
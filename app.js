const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const path = require("path");
const db = require("./config/mongoose-connection");
const expressSession = require("express-session");
const flash = require("connect-flash");

const ownerRouter = require("./routes/ownerRouter");
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
}));
app.use(flash());

app.use("/owner", ownerRouter);
app.use("/user", userRouter);
app.use("/product", productRouter);

app.listen(3000);
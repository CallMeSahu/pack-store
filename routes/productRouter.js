const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const zod = require("zod");
const isOwner = require("../middlewares/isOwner");
const productModel = require("../models/product-model");

router.get("/", (req, res) => {
  res.send("Hey from Product!");
});

const productSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  price: zod.number().positive("Price must be a positive number"),
  discount: zod.number().min(0).default(0),
  bgcolor: zod.string().optional(),
  panelcolor: zod.string().optional(),
  textcolor: zod.string().optional(),
});

router.post("/create", upload.single("image"), async (req, res) => {
    try {
        const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;
        const image = req.file ? req.file.buffer : null;

        const validation = productSchema.safeParse({
            name,
            price: Number(price),
            discount: discount ? Number(discount) : 0,
            bgcolor,
            panelcolor,
            textcolor,
        });

        if (!validation.success || !image) {
            req.flash("error", "Invalid inputs");
            return res.redirect("/owners/admin");
        }

        const createdProduct = await productModel.create({
            image,
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor,
        });

        if(createdProduct){
            req.flash("success", "Product created!");
            res.redirect("/owners/products");
        }

    } catch (error) {
        res.send(error.message);
    }
});

router.get("/removeproduct/:productid", isOwner, async(req, res) => {
    try {
       const productid = req.params.productid;
       await productModel.findByIdAndDelete(productid); 
       req.flash("warning", "Product deleted");
       res.redirect("/owners/products");
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const zod = require("zod");
const isOwner = require("../middlewares/isOwner");
const productModel = require("../models/product-model");
const { findByIdAndUpdate } = require("../models/owner-model");

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

router.get("/edit/:productid", isOwner, async(req, res) => {
    try {
        const success = req.flash("success");
        const error = req.flash("error");
        const productid = req.params.productid;
        const product = await productModel.findById(productid);
        res.render("editproducts", { product, success, error });
    } catch (error) {
        res.send(error.message);
    }
});

router.post("/edit/:productid", isOwner, upload.single('image'), async(req, res) => {
    try {
        const productid = req.params.productid;
        const product = await productModel.findById(productid);

        const image = req.file ? req.file.buffer : product.image;
        const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

        const validate = productSchema.safeParse({
            name,
            price: Number(price),
            discount: discount ? Number(discount) : 0,
            bgcolor,
            panelcolor,
            textcolor,
        });

        if (!validate.success || !image) {
            req.flash("error", "Invalid inputs");
            return res.redirect("/owners/admin");
        }

        const updatedProduct = await productModel.findByIdAndUpdate(productid, {
            name, price, discount, bgcolor, panelcolor, textcolor, image
        })

        if(updatedProduct){
            req.flash("success", "Product Updated!");
            res.redirect("/owners/products");
        }
    } catch (error) {
       res.send(error.message); 
    }
})

module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

    let product = await productModel.create({
      name,
      image: req.file.buffer,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
    });
    
    req.flash("success", "Product created successfully");
    res.redirect("/owners/admin"); 
  } catch (error) {
    res.status(500).send("Server Error");
  }

});

module.exports = router;

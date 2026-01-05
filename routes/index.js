const express = require("express");
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedin");
const productModel = require("../models/product-model");
const userModel = require("../models/user-models");

router.get("/", (req, res) => {
  let error = req.flash("error");
  res.render("index", { error, loggedin: false });
});

router.get("/shop", async (req, res) => {
  try {
    let products = await productModel.find();
    let success = req.flash("success");
    res.render("shop", { products, success });
  } catch (error) {
    console.error("Error fetching products:", error);
    req.flash("error", "Error fetching products");
    res.redirect("/");
  }
});


router.get("/addfromcart/:id", isLoggedin, async (req, res) => {
  try {
   
    let user = await userModel.findOne({ email: req.user.email });
    if (!user) 
    {
      req.flash("error", "User not found");
      return res.redirect("/login");
    }

    const productIndex = user.cart.findIndex(
      (item) => item.rid && item.rid.toString() === req.params.id
    );

    if (productIndex !== -1) { 
      user.cart[productIndex].quantity += 1;
    } else {
      user.cart.push({ rid: req.params.id, quantity: 1 });
    }

    await user.save();

    req.flash("success", "Product added to cart");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error adding to cart:", error);
    req.flash(
      "error",
      "An error occurred while adding the product to the cart"
    );
    res.redirect("/shop");
  }
});

router.get("/removefromcart/:id", isLoggedin, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });

    // Remove product from cart
    const productIndex = user.cart.findIndex(
      (item) => item.rid && item.rid.toString() === req.params.id
    );

    user.cart[productIndex].quantity -= 1;
    if (user.cart[productIndex].quantity === 0) {
      user.cart.splice(productIndex, 1);
    }

    await user.save();

    req.flash("success", "Product removed from cart");
    res.redirect("/cart");
  } catch (error) {
    console.error("Error removing product from cart:", error);
    req.flash(
      "error",
      "An error occurred while removing the product from the cart"
    );
    res.redirect("/cart");
  }
});

router.get("/cart", isLoggedin, async (req, res) => {
  try {
    let user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart.rid"); // Populate cart items with product details
    res.render("cart", { user });
  } catch (error) {
    console.error("Error loading cart:", error);
    req.flash("error", "An error occurred while loading your cart");
    res.redirect("/shop");
  }
});

// JSON API to add product to cart (used by client-side JS)
router.post("/api/cart/add", isLoggedin, async (req, res) => {
  try {
    const id = req.body.id;
    let user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let productIndex = user.cart.findIndex(
      (item) => item.rid && item.rid.toString() === id
    );

    if (productIndex !== -1) {
      user.cart[productIndex].quantity += 1;
    } else {
      user.cart.push({ rid: id, quantity: 1 });
      productIndex = user.cart.length - 1;
    }

    await user.save();

    return res.json({ success: true, quantity: user.cart[productIndex].quantity });
  } catch (error) {
    console.error("Error adding to cart (API):", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// JSON API to remove (decrement) product from cart (used by client-side JS)
router.post("/api/cart/remove", isLoggedin, async (req, res) => {
  try {
    const id = req.body.id;
    let user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const productIndex = user.cart.findIndex(
      (item) => item.rid && item.rid.toString() === id
    );

    if (productIndex === -1) {
      return res.json({ success: true, quantity: 0 });
    }

    user.cart[productIndex].quantity -= 1;
    let newQuantity = user.cart[productIndex].quantity;
    if (newQuantity <= 0) {
      user.cart.splice(productIndex, 1);
      newQuantity = 0;
    }

    await user.save();

    return res.json({ success: true, quantity: newQuantity });
  } catch (error) {
    console.error("Error removing from cart (API):", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/logout", isLoggedin, (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      req.flash("error", "An error occurred during logout");
    }
    res.redirect("/");
  });
});

module.exports = router;

const jwt = require("jsonwebtoken");
const userModel = require("../models/user-models");

module.exports = async (req, res, next) => {
  if (!req.cookies.authToken) {
    req.flash('error',"You need to login first");
    return res.redirect("/");
  }

  try {
    const token = req.cookies.authToken;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await userModel.findOne({ email: decoded.email }).select("-password");
    let currUser = await userModel.findOne({ email: decoded.email });
    if (!currUser) {
      req.flash('error',"You must login first");
      return res.redirect("/");
    }
    req.user = user;
    next();
   } 
   catch (err) {
    req.flash('error',"Something went wrong");
    return res.redirect("/");
  }
};
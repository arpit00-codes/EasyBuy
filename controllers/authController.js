const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");
const userModel = require("../models/user-models");

module.exports.registerUser = async function (req, res) {
  try {
    let { fullname, email, password } = req.body;
    let user = await userModel.findOne({ email });

    if (user) {
      req.flash("error", "You already have an account. Please login");
      return res.redirect("/");
    }

    bcrypt.hash(password, 12, async (err, hash) => {
      if (err) {
        return res.status(500).send("Password encryption failed");
      }
      password = hash;

      const user = await new userModel({
        fullname,
        email,
        password,
      });

      let token = generateToken(user);
      res.cookie("authToken", token);

      await user.save();
      res.redirect("/shop");

    });
  } catch (err) {
    res.status(500).send("Registration failed");
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });

    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/");
    }

    let passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/");
    }

    let token = generateToken(user);
    res.cookie("authToken", token);

    return res.redirect("/shop");
  } catch (err) {
    req.flash("error", "Invalid email or password");
    return res.redirect("/");
  }
};

module.exports.logout = function (req, res) {
  res.cookie("authToken", "");
  res.redirect("/");
};

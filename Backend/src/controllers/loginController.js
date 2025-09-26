const { User } = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const loginController = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log(req.body);
    // Find user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ status: "fail", message: `${role.charAt(0).toUpperCase() + role.slice(1)} not found` });
    }
    if (user.isApproved === false) {
      return res.status(403).json({ status: "fail", message: `${role.charAt(0).toUpperCase() + role.slice(1)} not approved, Please contact the administrator for assistance.` });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "fail", message: "Incorrect password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    // .env: JWT_COOKIE_EXPIRES_IN=7
    const days = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 1;
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: false, //for localhost only
      sameSite: 'lax',//for localhost only
    });
    // All user profile data is now in the User model
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

module.exports = loginController;

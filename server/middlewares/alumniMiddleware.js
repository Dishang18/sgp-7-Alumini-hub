const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({
      message: "Access denied. No token provided.",
      success: false,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.jwt_secret);
    req.body.alumniID = decoded.alumniID;
    req.alumniID = decoded.alumniID;
    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message);
    return res.status(401).send({
      message: "Access denied. Invalid or expired token.",
      success: false,
    });
  }
};

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Log the header for debugging
  console.log("🔑 Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({
      message: "Access denied. No token provided.",
      success: false,
    });
  }

  const token = authHeader.split(" ")[1];
  console.log("📌 Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.jwt_secret);
    console.log("✅ Decoded Token:", decoded);

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

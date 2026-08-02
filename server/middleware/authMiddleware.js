const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

module.exports = requireAuth;
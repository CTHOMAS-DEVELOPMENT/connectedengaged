const jwt = require("jsonwebtoken");
const { loadEnvVariables } = require("./utils");
loadEnvVariables();
const JWT_SECRET = process.env.LG_TOKEN;
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token provided in Authorization header");
    return res.status(401).json({ message: "Token missing or unauthorized" });
  }
  //FlabYaGal
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user; // Attach the decoded token payload (e.g., userId) to the request
    next();
  });
};

module.exports = authenticateToken;

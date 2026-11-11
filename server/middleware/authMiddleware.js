const jwt = require("jsonwebtoken");

// Check the bearer token before allowing a request to reach a private route.
function protect(req, res, next) {
  const authorization = req.headers.authorization;
  const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({ message: "Authorization token is required." });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");
    return res.status(500).json({ message: "Server authentication is not configured." });
  }

  try {
    // Verify the token signature and expiry, then make its user data available to the route.
    req.user = jwt.verify(match[1], process.env.JWT_SECRET);
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Authorization token is invalid or expired." });
    }

    console.error("Could not verify authorization token:", error);
    return res.status(500).json({ message: "Could not verify authorization token." });
  }
}

module.exports = protect;

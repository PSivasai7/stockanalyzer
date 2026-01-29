const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // 1. Check if the token exists in the Authorization Header
  // Professional format: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Extract the token (Remove "Bearer " from the string)
      token = req.headers.authorization.split(" ")[1];

      // 3. Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Attach the decoded user ID to the request object
      // This allows the next function to know WHO is making the request
      req.user = decoded;

      // 5. Move to the next function (the actual logic)
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ error: "Not authorized, no token provided" });
  }
};

module.exports = { protect };

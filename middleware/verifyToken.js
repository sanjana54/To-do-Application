const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        // Handle invalid or expired token
        res.redirect("/login");
      } else {
        // Valid token, proceed to the next middleware
        next();
      }
    });
  } else {
    // No token found, redirect to login
    res.redirect("/login");
  }
};

module.exports = verifyToken;
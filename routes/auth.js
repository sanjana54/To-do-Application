const express = require("express");
const authController = require("../controllers/auth");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});



module.exports = router;
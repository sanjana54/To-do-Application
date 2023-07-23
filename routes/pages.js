const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const authController = require("../controllers/auth");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/home", authController.view);
//router.post('/', authController.find);
router.get("/addtask", authController.form);

router.post("/addtask", authController.create);

router.get("/edittask/:Id", authController.edit);
router.post("/edittask/:Id", authController.update);
router.get("/viewtask/:Id", authController.viewall);
router.get("/:Id", authController.delete);

module.exports = router;
const express = require("express");
const { register, login } = require("../controllers/AuthController");
const {
  validateSignup,
  validateLogin,
} = require("../middlewares/validationMiddlewares");
const { runValidation } = require("../middlewares/validationError");
const router = express.Router();

router.post("/register", validateSignup, runValidation, register);
router.post("/login", validateLogin, runValidation, login);

module.exports = router;

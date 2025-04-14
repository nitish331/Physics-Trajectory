const express = require("express");
const {
  register,
  login,
  logoutUser,
} = require("../controllers/AuthController");
const {
  validateSignup,
  validateLogin,
} = require("../middlewares/validationMiddlewares");
const { runValidation } = require("../middlewares/validationError");
const passport = require("passport");
const router = express.Router();

router.post("/register", validateSignup, runValidation, register);
router.post("/login", validateLogin, runValidation, login);
router.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  logoutUser
);

module.exports = router;

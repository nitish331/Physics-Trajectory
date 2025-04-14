const express = require("express");
const router = express.Router();

const authRoutes = require("./AuthRouter");

router.use(authRoutes);

module.exports = router;

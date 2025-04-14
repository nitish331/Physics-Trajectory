const express = require("express");
const router = express.Router();

const authRoutes = require("./AuthRouter");
const adminRoutes = require("./adminRoutes");

router.use(authRoutes);

router.use(adminRoutes);

module.exports = router;

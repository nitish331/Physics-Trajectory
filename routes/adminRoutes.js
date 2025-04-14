const express = require("express");
const { isAdmin } = require("../middlewares/adminMiddlewares");
const {
  createTest,
  getTest,
  addQuestion,
  deleteQuestion,
  updateQuestion,
  deleteTest,
  updateTest,
  scheduleTest,
  cancellingScheduledTest,
  getAllTests,
  getTestResults,
} = require("../controllers/adminController/AdminTestController");
const passport = require("passport");
const router = express.Router();

router.post(
  "/tests",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  createTest
);

router.get(
  "/tests/:testId",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  getTest
);

router.post(
  "/tests/:testId/questions",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  addQuestion
);

router.delete(
  "/tests/:testId/questions/:questionId",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  deleteQuestion
);

router.put(
  "/tests/:testId/questions/:questionId",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  updateQuestion
);

// Add to src/routes/adminRoutes.js
router.put(
  "/tests/:testId",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  updateTest
);

router.delete(
  "/tests/:testId",
  passport.authenticate("jwt", { session: false }),
  deleteTest
);

router.post(
  "/tests/:testId/schedule",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  scheduleTest
);

router.post(
  "/tests/:testId/cancel-schedule",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  cancellingScheduledTest
);

router.get(
  "/tests",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  getAllTests
);

router.get(
  "/tests/:testId/results",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  getTestResults
);

module.exports = router;

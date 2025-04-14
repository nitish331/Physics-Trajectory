const jwt = require("jsonwebtoken");
const TestAttempt = require("../models/TestAttemptModel");
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Helper function to calculate test statistics
const calculateTestStatistics = async (testId) => {
  const attempts = await TestAttempt.find({
    test: testId,
    completed: true,
  });

  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0,
    };
  }

  const scores = attempts.map((a) => a.score);
  const totalScores = scores.reduce((acc, score) => acc + score, 0);

  // Assume passing score is 60%
  const passCount = attempts.filter(
    (a) => (a.score / a.totalPossibleScore) * 100 >= 60
  ).length;

  return {
    totalAttempts: attempts.length,
    averageScore: totalScores / attempts.length,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    passRate: (passCount / attempts.length) * 100,
  };
};

module.exports = { generateToken, calculateTestStatistics };

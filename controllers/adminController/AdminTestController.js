const Test = require("../../models/TestModel");
const {
  scheduleTestActivation,
  cancelScheduledTest,
} = require("../../utils/TestSchedulerService");
const TestAttempt = require("../../models/TestAttemptModel");
const { calculateTestStatistics } = require("../../utils/helper");

// Create a new test
exports.createTest = async (req, res) => {
  try {
    const { title, description, duration } = req.body;

    // Validate required fields
    if (!title || !description || !duration) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and duration are required",
      });
    }

    // Create new test without questions
    const test = new Test({
      title,
      description,
      duration,
      createdBy: req.user._id,
      questions: [],
      isActive: false,
    });

    // Save test to database
    await test.save();

    return res.status(201).json({
      success: true,
      message: "Test created successfully",
      data: test,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error: "something went wrong",
    });
  }
};

// Add question to an existing test
exports.addQuestion = async (req, res) => {
  try {
    const { testId } = req.params;
    const { question, marks = 1, options, correctAnswer } = req.body;

    // Validate required fields
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question text is required",
      });
    }

    if (!options || options.length == 0) {
      return res.status(400).json({
        success: false,
        message: "Option text is required",
      });
    }

    if (correctAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: "Correct answer is required",
      });
    }

    // validate that correct answer exist in the solution
    if (question.options.length < correctAnswer || correctAnswer < 0) {
      return res.status(400).json({
        success: false,
        message: "The correct answer index is invalid",
      });
    }

    // Find test by ID
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Add new question to the test
    const newQuestion = {
      question: question,
      options: options,
      correctAnswer: correctAnswer,
      marks: marks,
    };

    test.questions.push(newQuestion);
    await test.save();

    return res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: test.questions[test.questions.length - 1],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a question from a test
exports.deleteQuestion = async (req, res) => {
  try {
    const { testId, questionId } = req.params;

    // Find test by ID
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Find question in the test
    const question = test.questions.id(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Remove the question
    question.remove();
    await test.save();

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      data: test.questions,
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a question in a test
exports.updateQuestion = async (req, res) => {
  try {
    const { testId, questionId } = req.params;
    const { question, marks, options, correctAnswer } = req.body;

    // Find test by ID
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Find question in the test
    const questionToUpdate = test.questions.id(questionId);
    if (!questionToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Update question fields if provided
    if (question) questionToUpdate.question = question;
    if (points) questionToUpdate.marks = marks;

    // Update options if provided
    if (options) questionToUpdate.options = options;

    // Update correct answer if provided
    if (correctAnswer !== undefined) {
      // Validate that the correct answer exists in options
      if (
        questionToUpdate.options.length < correctAnswer ||
        correctAnswer < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "The correct answer index is invalid",
        });
      }
      questionToUpdate.correctAnswer = correctAnswer;
    }

    await test.save();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: questionToUpdate,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update test details
exports.updateTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { title, description, duration } = req.body;

    // Find test by ID
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Update fields if provided
    if (title) test.title = title;
    if (description) test.description = description;
    if (duration) test.duration = duration;

    await test.save();

    return res.status(200).json({
      success: true,
      message: "Test updated successfully",
      data: test,
    });
  } catch (error) {
    console.error("Error updating test:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a test
exports.deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;

    // Find test by ID
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Optional: Check if anyone has taken this test
    const testAttempts = await TestAttempt.countDocuments({ test: testId });
    if (testAttempts > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete test with existing attempts. Consider deactivating it instead.",
      });
    }

    // Delete the test
    await Test.findByIdAndDelete(testId);

    return res.status(200).json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting test:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a specific test with all questions and options
exports.getTest = async (req, res) => {
  try {
    const { testId } = req.params;

    // Find test by ID and populate creator info
    const test = await Test.findById(testId).populate("createdBy", "username");

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error("Error retrieving test:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Schedule a test to become active
exports.scheduleTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { delay = 15 } = req.body; // Default 15 minutes

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Calculate start and end times
    const startTime = new Date(Date.now() + delay * 60 * 1000); // Current time + delay in minutes
    const endTime = new Date(startTime.getTime() + test.duration * 60 * 1000); // Start time + test duration

    // Update test with scheduled times
    test.scheduledStartTime = startTime;
    test.scheduledEndTime = endTime;
    await test.save();

    // Schedule test activation
    scheduleTestActivation(test._id, startTime, endTime);

    return res.status(200).json({
      success: true,
      message: `Test scheduled to start at ${startTime.toISOString()} and end at ${endTime.toISOString()}`,
      data: {
        testId: test._id,
        startTime,
        endTime,
        delay,
      },
    });
  } catch (error) {
    console.error("Error scheduling test:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancelling a scheduled Test
exports.cancellingScheduledTest = async (req, res) => {
  try {
    const { testID } = req.params;

    const cancelled = await cancelScheduledTest(testId);

    if (cancelled) {
      return res.status(200).json({
        success: true,
        message: "Test schedule cancelled successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No scheduled test found to cancel",
      });
    }
  } catch (error) {
    console.error("Error in cancelling the scheduledTest", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all tests
exports.getAllTests = async (req, res) => {
  try {
    // Query parameters for filtering and pagination
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build query conditions
    const conditions = {};
    conditions.createdBy = req.user._id;

    // Add search functionality
    if (search) {
      conditions.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Create sort object
    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const tests = await Test.find(conditions)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Test.countDocuments(conditions);

    return res.status(200).json({
      success: true,
      count: tests.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: tests,
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all results for a specific test
exports.getTestResults = async (req, res) => {
  try {
    const { testId } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = "score",
      order = "desc",
    } = req.query;

    // Verify test exists
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Create sort object
    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find all completed attempts for this test
    const attempts = await TestAttempt.find({
      test: testId,
      completed: true,
    })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "username email")
      .select("user score totalPossibleScore startTime endTime answers");

    // Get total count for pagination
    const total = await TestAttempt.countDocuments({
      test: testId,
      completed: true,
    });

    const stats = await calculateTestStatistics(testId);

    return res.status(200).json({
      success: true,
      count: attempts.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      testDetails: {
        title: test.title,
        description: test.description,
        duration: test.duration,
      },
      statistics: stats,
      data: attempts.map((attempt) => ({
        id: attempt._id,
        user: {
          id: attempt.user._id,
          username: attempt.user.username,
          email: attempt.user.email,
        },
        score: attempt.score,
        totalPossibleScore: attempt.totalPossibleScore,
        percentage: (attempt.score / attempt.totalPossibleScore) * 100,
        answeredQuestions: attempt.answers.length,
      })),
    });
  } catch (error) {
    console.error("Error fetching test results:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

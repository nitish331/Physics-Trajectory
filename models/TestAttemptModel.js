const mongoose = require("mongoose");

const TestAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    maximumMarks: {
      type: Number,
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        userAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestAttempt", TestAttemptSchema);

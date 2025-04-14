const Test = require("../models/TestModel");
const io = require("../socket");

// Map to store active schedulers by test ID
const activeSchedulers = new Map();

// Schedule test activation and deactivation
exports.scheduleTestActivation = async (testId, startTime, endTime) => {
  try {
    // Calculate delays in milliseconds
    const now = new Date();
    const startDelay = startTime.getTime() - now.getTime();
    const endDelay = endTime.getTime() - now.getTime();

    // Clear any existing timers for this test
    if (activeSchedulers.has(testId)) {
      const { startTimer, endTimer } = activeSchedulers.get(testId);
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    }

    // Schedule test activation
    const startTimer = setTimeout(async () => {
      await activateTest(testId);
    }, startDelay);

    // Schedule test deactivation
    const endTimer = setTimeout(async () => {
      await deactivateTest(testId);
    }, endDelay);

    // Store timers for potential cancellation
    activeSchedulers.set(testId, { startTimer, endTimer });

    // Emit scheduling event
    io.getIO().emit("test_scheduled", {
      testId,
      startTime,
      endTime,
    });

    console.log(
      `Test ${testId} scheduled to start at ${startTime} and end at ${endTime}`
    );
  } catch (error) {
    console.error("Error in scheduleTestActivation:", error);
  }
};

// Activate a test
const activateTest = async (testId) => {
  try {
    const test = await Test.findById(testId);
    if (!test) {
      console.error(`Test ${testId} not found during activation`);
      return;
    }

    // Update test status
    test.isActive = true;
    await test.save();

    // Notify clients
    io.getIO().emit("test_activated", {
      testId: test._id,
      title: test.title,
      activatedAt: new Date(),
    });

    console.log(`Test ${testId} activated at ${new Date()}`);
  } catch (error) {
    console.error("Error activating test:", error);
  }
};

// Deactivate a test
const deactivateTest = async (testId) => {
  try {
    const test = await Test.findById(testId);
    if (!test) {
      console.error(`Test ${testId} not found during deactivation`);
      return;
    }

    // Update test status
    test.isActive = false;
    await test.save();

    // Remove from active schedulers
    activeSchedulers.delete(testId);

    // Notify clients
    io.getIO().emit("test_deactivated", {
      testId: test._id,
      title: test.title,
      deactivatedAt: new Date(),
    });

    console.log(`Test ${testId} deactivated at ${new Date()}`);
  } catch (error) {
    console.error("Error deactivating test:", error);
  }
};

// Cancel scheduled test
exports.cancelScheduledTest = async (testId) => {
  try {
    if (activeSchedulers.has(testId)) {
      const { startTimer, endTimer } = activeSchedulers.get(testId);
      clearTimeout(startTimer);
      clearTimeout(endTimer);
      activeSchedulers.delete(testId);

      // Update the test in the database
      await Test.findByIdAndUpdate(testId, {
        scheduledStartTime: null,
        scheduledEndTime: null,
      });

      // Notify clients
      io.getIO().emit("test_schedule_cancelled", {
        testId,
        cancelledAt: new Date(),
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error("Error cancelling scheduled test:", error);
    return false;
  }
};

// Initialize function to restore scheduled tests after server restart
exports.initializeScheduler = async () => {
  try {
    // Find tests that are scheduled but not yet started/ended
    const scheduledTests = await Test.find({
      scheduledStartTime: { $ne: null },
      $or: [
        { isActive: false, scheduledStartTime: { $gt: new Date() } },
        { isActive: true, scheduledEndTime: { $gt: new Date() } },
      ],
    });

    console.log(`Reinitializing ${scheduledTests.length} scheduled tests...`);

    // Reschedule each test
    for (const test of scheduledTests) {
      const now = new Date();

      // Test is scheduled but hasn't started yet
      if (!test.isActive && test.scheduledStartTime > now) {
        this.scheduleTestActivation(
          test._id,
          test.scheduledStartTime,
          test.scheduledEndTime
        );
      }
      // Test is active but hasn't ended yet
      else if (test.isActive && test.scheduledEndTime > now) {
        // Just schedule the deactivation
        const endDelay = test.scheduledEndTime.getTime() - now.getTime();

        const endTimer = setTimeout(async () => {
          await deactivateTest(test._id);
        }, endDelay);

        activeSchedulers.set(test._id.toString(), {
          startTimer: null,
          endTimer,
        });

        console.log(
          `Active test ${test._id} scheduled to end at ${test.scheduledEndTime}`
        );
      }
    }
  } catch (error) {
    console.error("Error initializing test scheduler:", error);
  }
};

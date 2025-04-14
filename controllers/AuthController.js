const User = require("../models/User");
const { generateToken } = require("../utils/helper");

// Register user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
        error: "user already exist",
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
        message: "User Registered succesfully",
      });
    } else {
      res.status(400).json({
        message: "User Already exist",
        success: false,
        error: "Invalid User Data",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
        message: "User login successfull",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: "Email and Password does not match",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went Wrong",
      error: error.message,
    });
  }
};

exports.logoutUser = function (req, res) {
  req.logout(function (err) {
    return res.status(200).json({
      success: true,
      message: "Logout succesfully",
    });
  });
};

const { validationResult } = require("express-validator");

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return first error only
    return res.status(400).json({ errors: errors.array()[0].msg });
  }
  next();
};

const mongoose = require("mongoose");

/* -------------------------------------------------------------------------- */
/*                              Helper                                        */
/* -------------------------------------------------------------------------- */

const validateUserId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

/* -------------------------------------------------------------------------- */
/*                         Validate Chat User                                 */
/* -------------------------------------------------------------------------- */

const validateChatUser = (req, res, next) => {
  const { userId } = req.params;

  if (!userId || !validateUserId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Valid userId is required.",
    });
  }

  next();
};

/* -------------------------------------------------------------------------- */
/*                    Validate Mark Messages As Read                          */
/* -------------------------------------------------------------------------- */

const validateMarkMessagesAsRead = (req, res, next) => {
  const { userId } = req.params;

  if (!userId || !validateUserId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Valid userId is required.",
    });
  }

  next();
};

/* -------------------------------------------------------------------------- */
/*                                Exports                                     */
/* -------------------------------------------------------------------------- */

module.exports = {
  validateChatUser,
  validateMarkMessagesAsRead,
};

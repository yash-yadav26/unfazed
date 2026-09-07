const {
  getChatMessagesService,
  markMessagesAsReadService,
  getUnreadMessagesCountService,
} = require("../services/chat.service");

/* -------------------------------------------------------------------------- */
/*                         Get Chat Messages                                  */
/* -------------------------------------------------------------------------- */

const getChatMessagesController = async (req, res, next) => {
  try {
    const { userId: otherUserId } = req.params;

    const messages = await getChatMessagesService({
      userId: req.user.id,
      otherUserId,
    });

    return res.status(200).json({
      success: true,
      message: "Chat messages fetched successfully.",
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                       Mark Messages As Read                                */
/* -------------------------------------------------------------------------- */

const markMessagesAsReadController = async (req, res, next) => {
  try {
    const { userId: otherUserId } = req.params;

    const result = await markMessagesAsReadService({
      userId: req.user.id,
      otherUserId,
    });

    return res.status(200).json({
      success: true,
      message: "Messages marked as read successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                    Get Unread Messages Count                              */
/* -------------------------------------------------------------------------- */

/**
 * Get unread message counts for the authenticated user.
 *
 * Returns conversation-wise unread counts so the frontend
 * can display badges on Chat buttons.
 */
const getUnreadMessagesCountController = async (req, res, next) => {
  try {
    const unreadData = await getUnreadMessagesCountService({
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Unread message counts fetched successfully.",
      data: unreadData,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  getChatMessagesController,
  markMessagesAsReadController,
  getUnreadMessagesCountController,
};

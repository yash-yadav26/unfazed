const Message = require("../models/message.model");

/* -------------------------------------------------------------------------- */
/*                            Get Chat Messages                               */
/* -------------------------------------------------------------------------- */

/**
 * Get complete chat history between two users.
 *
 * Returns messages in chronological order.
 */
const getChatMessages = async ({
  userId,
  userType,
  otherUserId,
  otherUserType,
}) => {
  return Message.find({
    $or: [
      {
        senderId: userId,
        senderType: userType,
        receiverId: otherUserId,
        receiverType: otherUserType,
      },
      {
        senderId: otherUserId,
        senderType: otherUserType,
        receiverId: userId,
        receiverType: userType,
      },
    ],
  })
    .sort({ createdAt: 1 })
    .lean();
};

/* -------------------------------------------------------------------------- */
/*                           Create Chat Message                              */
/* -------------------------------------------------------------------------- */

/**
 * Create and save a new chat message.
 *
 * Called from Socket.io when a user sends a message.
 */
const createMessage = async ({
  senderId,
  senderType,
  receiverId,
  receiverType,
  message,
}) => {
  return Message.create({
    senderId,
    senderType,
    receiverId,
    receiverType,
    message,
  });
};

/* -------------------------------------------------------------------------- */
/*                        Mark Messages As Read                               */
/* -------------------------------------------------------------------------- */

/**
 * Mark all unread messages received from the other user as read.
 */
const markMessagesAsRead = async ({
  userId,
  userType,
  otherUserId,
  otherUserType,
}) => {
  return Message.updateMany(
    {
      senderId: otherUserId,
      senderType: otherUserType,
      receiverId: userId,
      receiverType: userType,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );
};

/* -------------------------------------------------------------------------- */
/*                      Get Unread Messages Count                            */
/* -------------------------------------------------------------------------- */

/**
 * Get unread message count grouped by conversation.
 *
 * Returns unread messages received by the authenticated
 * Client or Therapist, grouped by sender.
 */
const getUnreadMessagesCount = async ({ userId, userType }) => {
  return Message.aggregate([
    {
      $match: {
        receiverId: userId,
        receiverType: userType,
        isRead: false,
      },
    },
    {
      $group: {
        _id: {
          senderId: "$senderId",
          senderType: "$senderType",
        },
        unreadCount: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        userId: "$_id.senderId",
        userType: "$_id.senderType",
        unreadCount: 1,
      },
    },
    {
      $sort: {
        unreadCount: -1,
      },
    },
  ]);
};

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = {
  getChatMessages,
  createMessage,
  markMessagesAsRead,
  getUnreadMessagesCount,
};

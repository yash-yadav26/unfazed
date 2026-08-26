const sendNotification = async ({
  userId,
  type,
  message,
}) => {
  // Actual notification logic
  // notification module banne par implement hoga.

  console.log({
    userId,
    type,
    message,
  });
};

module.exports = {
  sendNotification,
};
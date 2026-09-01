const Client = require("../models/client.model");

// ===============================
// Find Client Profile by User ID
// ===============================

const findClientByUserId = async (userId) => {
  return await Client.findOne({ userId }).lean();
};

// ===============================
// Create Client Profile
// ===============================

const createClient = async (clientData) => {
  return await Client.create(clientData);
};

// ===============================
// Update Client Profile by User ID
// ===============================

const updateClientByUserId = async (userId, data) => {
  return await Client.findOneAndUpdate({ userId }, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
};

// ===============================
// Delete Client Profile by User ID
// ===============================

const deleteClientByUserId = async (userId) => {
  return await Client.findOneAndDelete({ userId });
};

module.exports = {
  findClientByUserId,
  createClient,
  updateClientByUserId,
  deleteClientByUserId,
};

const generateInvoice = async (paymentData) => {
  // Actual invoice generation
  // payment module ke time implement hoga.

  return {
    success: true,
    paymentId: paymentData.paymentId,
  };
};

module.exports = {
  generateInvoice,
};
const entitlementMiddleware = (featureKey) => {
  return async (req, res, next) => {
    try {
      // Actual entitlement check
      // subscription module banne ke baad yahan aayega.

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = entitlementMiddleware;
const jwtConfig = {
  secret: process.env.JWT_SECRET,

  accessTokenExpiry:
    process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m",

};

module.exports = jwtConfig;
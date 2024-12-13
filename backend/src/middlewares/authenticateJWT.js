const { expressjwt: expressJwt } = require("express-jwt");

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const authenticateJWT = expressJwt({
  secret: process.env.ACCESS_TOKEN_SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth",
  credentialsRequired: true,
}).unless({
  path: ["/login", "/register"],
});

module.exports = authenticateJWT;

const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
const { JWT_SECRET } = process.env;

const refreshTokens = {};
// this will be used when a token needs to be verified on a http request inside Controller.
const signToken = (user) => {
  const exp = Math.floor(Date.now() / 1000) + 600 * 600;
  const refreshToken = randtoken.uid(256);
  const accessToken = jwt.sign(
    {
      exp,
      data: user,
    },
    JWT_SECRET
  );
  refreshTokens[refreshToken] = user.email;
  return { exp, data: user, accessToken, refreshToken };
};

// This should be used when a token needs to be verified on a http request.
const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers["Authorization"];
  try {
    if (tokenHeader) {
      const token = tokenHeader.substring("Bearer ".length);
      // parse Bearer Token
      jwt.verify(token, JWT_SECRET);
      // successfully authenticated
      next();
    } else {
      // token does not exists in the request
      res.sendStatus(403);
    }
  } catch (error) {
    // unauthenticated, token expired

    res.sendStatus(401);
  }
};

module.exports = { signToken, verifyToken };

const jwt = require('jsonwebtoken');

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret');
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret');
};

module.exports = {
  signToken,
  verifyToken
};

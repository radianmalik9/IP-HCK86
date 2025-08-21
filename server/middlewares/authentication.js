const { verifyToken } = require('../helper/jwt');
const { User } = require('../models');

const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    
    if (!authorization) {
      throw { name: 'Unauthorized', message: 'Access token is required' };
    }

    const token = authorization.split(' ')[1];
    
    if (!token) {
      throw { name: 'Unauthorized', message: 'Invalid token format' };
    }

    const payload = verifyToken(token);
    
    const user = await User.findByPk(payload.id);
    
    if (!user) {
      throw { name: 'Unauthorized', message: 'User not found' };
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorization = (roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw { name: 'Forbidden', message: 'Access denied' };
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authentication,
  authorization
};

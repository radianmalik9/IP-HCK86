const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  let status = 500;
  let message = 'Internal Server Error';

  switch (error.name) {
    case 'SequelizeValidationError':
    case 'SequelizeUniqueConstraintError':
      status = 400;
      message = error.errors[0].message;
      break;
    case 'SequelizeForeignKeyConstraintError':
      status = 400;
      message = 'Foreign key constraint error';
      break;
    case 'JsonWebTokenError':
      status = 401;
      message = 'Invalid token';
      break;
    case 'TokenExpiredError':
      status = 401;
      message = 'Token expired';
      break;
    case 'Unauthorized':
      status = 401;
      message = error.message || 'Unauthorized access';
      break;
    case 'Forbidden':
      status = 403;
      message = error.message || 'Access forbidden';
      break;
    case 'NotFound':
      status = 404;
      message = error.message || 'Data not found';
      break;
    case 'BadRequest':
      status = 400;
      message = error.message || 'Bad request';
      break;
    default:
      if (error.status) {
        status = error.status;
        message = error.message;
      }
      break;
  }

  res.status(status).json({
    success: false,
    message: message
  });
};

module.exports = {
  errorHandler
};

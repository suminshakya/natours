const AppError = require('../utils/appError');
const APIError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new APIError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field : ${value[0]}`;
  return new APIError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJwtError = () => {
  return new AppError('Invalid token.Please login again!', 401);
};

const handleTokenExpiry = () => {
  return new AppError('Token Expired', 401);
};

const sendErrorDev = (req, res, err) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    console.log(err.stack);
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // RENDERED WEBSITE

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (req, res, err) => {
  // API
  console.log(err);
  if (req.originalUrl.startsWith('/api')) {
    // Operational error : made error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming error : unknown error : dont leak to client
    }
  
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!',
    });
  }
  // RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
    // Programming error : unknown error : dont leak to client
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.log('dev');
    sendErrorDev(req, res, err);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    console.log('prod');
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.code === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJwtError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiry();
    }

    sendErrorProd(req, res, error);
  }
};

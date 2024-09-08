const AppError = require('../utils/appError');

// Handling Invalid Database IDs
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handling Duplicate fields
const handleDuplicateFieldsDB = (err) => {
  // const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const value = err.keyValue.name;
  // console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Handling Mongoose Validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handling JWT error
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

// Handling Expired JWT error
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again!', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api'))
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  // B) Rendered website
  else
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // a) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // b) Programming or other unknown errors: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }

  // B) Rendered website
  else {
    // a) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    }
    // b) Programming or other unknown errors: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    return res.status(500).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later.',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    // Handling Invalid Database IDs
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    // Handling Duplicate Fields
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // Handling Mongoose Validation errors
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    // Handling JWT error
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  // Get value from error message that is between quotes (it means that it is field name)
  // This will return an array which from we need first element
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}, please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // 1) Log error
    console.log(err);

    // 2) Send generic response
    res.status(500).json({
      status: 'error',
      // Don't leak details to a client
      message: 'Something went very wrong.'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // It is not good to override parameters so we create hard copy
    let error = { ...err };

    // 'CastError' is mongoose error (eg. cannot cast to ObjectID format)
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    // '11000' is mongoose related error for duplicate keys
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // 'ValidationError' is mongoose error
    // it consists of errors array (error.errors)
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // All 4** have fail, rest of them have error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // This is set to later check if this error is one predicted by us or not
    // So it means, that every error created by us will be 'operational error'
    this.isOperational = true;

    // This function will not occur in stack strace (error.stack)
    Error.captureStackTrace(this, this.construtor);
  }
}

module.exports = AppError;

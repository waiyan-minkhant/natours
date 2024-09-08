class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Pass the message into the constructor of the parent class

    this.statusCode = statusCode;
    this.status = `${String(statusCode).startsWith('4') ? 'fail' : 'error'}`;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); // when a new obj is created, and a constructor function is called, that function call will not appear in the stack trace and won't pollute it.
  }
}

module.exports = AppError;

'use strict';
/**
 * Service, that serves unified errors
 */

let errors = {
  '000000': {
    statusCode: 500,
    message: 'Unknown error has occurred.',
  },
};

module.exports.createError = errorCode => {
  let _errorCode = errorCode;
  // If unknown error is provided
  if (!errors.hasOwnProperty(errorCode)) {
    // Setting the default error code
    _errorCode = '000000';
  }

  // Getting error data
  let e = errors[_errorCode];

  // Returning a new error
  return new SystemError(e.message, _errorCode, e.statusCode);
};

/**
 * System error class
 */
class SystemError extends Error {
  /**
   * Constructor function
   *
   * @param {string} message - Error message
   * @param {string} errorCode - Internal error code
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, errorCode, statusCode) {
    super(message);
    this.errorCode = errorCode || '000000';
    this.statusCode = statusCode || 500;
  }

  /**
   * Overriding the default `toJSON` method
   *
   * @return {{message, errorCode: (string), statusCode: (number)}}
   */
  toJSON() {
    return {
      message: this.message,
      errorCode: this.errorCode,
      statusCode: this.statusCode,
    }
  }
}

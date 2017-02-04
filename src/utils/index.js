'use strict';
/**
 * Function, that wraps a function with callback and returns
 * a function, that can operate like a callback-like and promise-like
 * function
 *
 * @param {Object|Function} ctx - Context, that a function will be called
 *                                or a function being wrapped
 * @param {Function?} fn - Function being wrapped
 * @return {Function}
 */
module.exports.upgradeFunction = function makeBetter(ctx, fn) {
  // Initializing variables to hold context and function
  let _ctx = null;
  let _fn;

  switch (arguments.length) {
    case 2:
      _ctx = ctx;
      _fn = fn;
      break;
    case 1:
      _fn = ctx;
      break;
    default:
      throw new Error('Wrong number of arguments provided');
  }

  // Getting the number of arguments of initial function
  const argsLength = _fn.length;

  // Returning a new function
  return function() {
    // Getting arguments as an array
    const args = [...arguments];

    // If number of initial arguments equals current arguments
    if (args.length === argsLength) {
      // Calling a function as usual
      return _fn.apply(_ctx, args);
    } else {
      // Creating a promise
      return new Promise((resolve, reject) => {
        _fn.apply(_ctx, [...args, function(err, result) {
          return err ? reject(err) : resolve(result);
        }]);
      });
    }
  }
};

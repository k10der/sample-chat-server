'use strict';
const nohm = require('nohm').Nohm;

module.exports = nohm.model('User', {
  properties: {
    username: {
      type: 'string',
      unique: true,
      validations: ['notEmpty'],
    },
    password: {
      type: 'string',
      validations: ['notEmpty'],
    }
  },
  methods: {
    /**
     * Function to check user's password
     *
     * @param password {string} - Password, that needs to be checked
     * @param cb {Function} - Callback function
     */
    checkPassword: function(password, cb) {
      // TODO change password checking logic
      setTimeout(() => {
        // If a wrong password is provided
        if (this.p('password') !== password) {
          // Returning an error
          return cb(new Error('Wrong credentials are provided'));
        }

        cb(null, this);
      })
    },
  },
  idGenerator: 'increment',
});

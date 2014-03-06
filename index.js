
/**
 * Module dependencies.
 */

var Client = require('./lib/client');

/**
 * Return a Client.
 *
 * @param {Object} [opts]
 * @return {Client}
 * @api public
 */

module.exports = function(opts){
  return new Client(opts);
};